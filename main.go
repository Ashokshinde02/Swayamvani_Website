package main

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
)

type Product struct {
	ID       int      `json:"id"`
	Name     string   `json:"name"`
	Category string   `json:"category"`
	Price    int      `json:"price"`
	Details  string   `json:"details"`
	Images   []string `json:"images"`
	VideoURL string   `json:"video_url"`
}

type Video struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	URL   string `json:"url"`
}

type Inquiry struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type InquiryRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

type CheckoutItem struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type CheckoutRequest struct {
	Items []CheckoutItem `json:"items"`
}

type OfferConfig struct {
	Title         string `json:"title"`
	Desc          string `json:"desc"`
	DiscountTitle string `json:"discountTitle"`
	DiscountDesc  string `json:"discountDesc"`
	LessonsTitle  string `json:"lessonsTitle"`
	LessonsDesc   string `json:"lessonsDesc"`
}

type ProductInput struct {
	Name     string   `json:"name"`
	Category string   `json:"category"`
	Price    int      `json:"price"`
	Details  string   `json:"details"`
	Images   []string `json:"images"`
	VideoURL string   `json:"video_url"`
}

type VideoInput struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type CustomerRegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CustomerLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CustomerAccount struct {
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	CreatedAt    time.Time `json:"created_at"`
}

type RazorpayOrderRequest struct {
	Items []CheckoutItem `json:"items"`
}

type RazorpayOrderResponse struct {
	ID       string `json:"id"`
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

type Storage interface {
	ListProducts() ([]Product, error)
	ListVideos() ([]Video, error)
	CreateVideo(VideoInput) (Video, error)
	DeleteVideo(int) error
	CreateProduct(ProductInput) (Product, error)
	UpdateProduct(int, ProductInput) (Product, error)
	DeleteProduct(int) error
	SaveInquiry(InquiryRequest) error
	ListInquiries() ([]Inquiry, error)
}

type MemoryStorage struct {
	mu          sync.RWMutex
	products    []Product
	videos      []Video
	inquiries   []Inquiry
	nextProduct int
	nextVideo   int
	nextInquiry int
}

type SQLStorage struct {
	db     *sql.DB
	vendor string
}

type SessionManager struct {
	mu       sync.Mutex
	sessions map[string]time.Time
	ttl      time.Duration
}

type Server struct {
	store             Storage
	emailRegex        *regexp.Regexp
	adminUser         string
	adminPass         string
	sessions          *SessionManager
	customerSessions  *SessionManager
	customerSessionMu sync.RWMutex
	customerSessionTo map[string]string
	customerMu        sync.RWMutex
	customers         map[string]CustomerAccount
	customerDataPath  string
	offerConfig       OfferConfig
	offerMu           sync.RWMutex
	offerConfigPath   string
	razorpayKeyID     string
	razorpayKeySecret string
}

func main() {
	store, mode, err := createStorage()
	if err != nil {
		log.Fatalf("storage setup failed: %v", err)
	}

	adminUser := strings.TrimSpace(os.Getenv("ADMIN_USER"))
	if adminUser == "" {
		adminUser = "admin"
	}
	adminPass := strings.TrimSpace(os.Getenv("ADMIN_PASSWORD"))
	if adminPass == "" {
		adminPass = "admin123"
		log.Println("warning: ADMIN_PASSWORD not set, using default 'admin123' for local use")
	}

	s := &Server{
		store:             store,
		emailRegex:        regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`),
		adminUser:         adminUser,
		adminPass:         adminPass,
		sessions:          newSessionManager(12 * time.Hour),
		customerSessions:  newSessionManager(12 * time.Hour),
		customerSessionTo: make(map[string]string),
		customers:         make(map[string]CustomerAccount),
		customerDataPath:  filepath.Join("data", "customers.json"),
		offerConfigPath:   filepath.Join("data", "offers.json"),
		razorpayKeyID:     strings.TrimSpace(os.Getenv("RAZORPAY_KEY_ID")),
		razorpayKeySecret: strings.TrimSpace(os.Getenv("RAZORPAY_KEY_SECRET")),
	}
	if err := s.loadCustomers(); err != nil {
		log.Printf("warning: failed to load customers file: %v", err)
	}
	if err := s.loadOffers(); err != nil {
		log.Printf("warning: failed to load offers file: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.handleHealthz)
	mux.HandleFunc("/api/products", s.handleProducts)
	mux.HandleFunc("/api/videos", s.handleVideos)
	mux.HandleFunc("/api/inquiry", s.handleInquiry)
	mux.HandleFunc("/api/checkout", s.handleCheckout)
	mux.HandleFunc("/api/payment/razorpay/order", s.handleCreateRazorpayOrder)
	mux.HandleFunc("/api/admin/login", s.handleAdminLogin)
	mux.HandleFunc("/api/admin/logout", s.handleAdminLogout)
	mux.HandleFunc("/api/admin/me", s.handleAdminMe)
	mux.HandleFunc("/api/customer/register", s.handleCustomerRegister)
	mux.HandleFunc("/api/customer/login", s.handleCustomerLogin)
	mux.HandleFunc("/api/customer/logout", s.handleCustomerLogout)
	mux.HandleFunc("/api/customer/me", s.handleCustomerMe)
	mux.HandleFunc("/api/offers", s.handleGetOffers)
	mux.HandleFunc("/api/admin/offers", s.handleAdminOffers)
	mux.HandleFunc("/api/admin/products", s.handleAdminProducts)
	mux.HandleFunc("/api/admin/products/", s.handleAdminProductByID)
	mux.HandleFunc("/api/admin/videos", s.handleAdminVideos)
	mux.HandleFunc("/api/admin/videos/", s.handleAdminVideoByID)
	mux.HandleFunc("/api/admin/inquiries", s.handleAdminInquiries)
	mux.HandleFunc("/api/admin/customers", s.handleAdminCustomers)
	mux.HandleFunc("/admin", s.handleAdminPage)
	mux.HandleFunc("/", s.handleHome)
	mux.Handle("/styles.css", http.FileServer(http.Dir(".")))
	mux.Handle("/script.js", http.FileServer(http.Dir(".")))
	mux.Handle("/demo.js", http.FileServer(http.Dir(".")))
	mux.Handle("/admin.js", http.FileServer(http.Dir(".")))
	mux.Handle("/about.html", http.FileServer(http.Dir(".")))
	mux.Handle("/demo.html", http.FileServer(http.Dir(".")))
	mux.Handle("/logo.jpeg", http.FileServer(http.Dir(".")))
	mux.Handle("/Indian_instrument.jpeg", http.FileServer(http.Dir(".")))
	mux.Handle("/assets/", http.StripPrefix("/", http.FileServer(http.Dir("."))))

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           withLogging(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("स्वयंवाणी server running at http://localhost:%s (%s)", port, mode)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server failed: %v", err)
	}
}

func createStorage() (Storage, string, error) {
	vendor := strings.ToLower(strings.TrimSpace(os.Getenv("DB_VENDOR")))
	dsn := strings.TrimSpace(os.Getenv("DB_DSN"))

	if vendor == "" || dsn == "" {
		m := newMemoryStorage(defaultProducts())
		return m, "memory", nil
	}
	if vendor != "postgres" && vendor != "mysql" {
		return nil, "", fmt.Errorf("DB_VENDOR must be postgres or mysql")
	}

	db, err := sql.Open(dbDriver(vendor), dsn)
	if err != nil {
		return nil, "", err
	}
	if err := db.Ping(); err != nil {
		return nil, "", err
	}

	sqlStore := &SQLStorage{db: db, vendor: vendor}
	if err := sqlStore.ensureSchema(); err != nil {
		return nil, "", err
	}
	if err := sqlStore.seedProducts(); err != nil {
		return nil, "", err
	}
	return sqlStore, vendor, nil
}

func dbDriver(vendor string) string {
	if vendor == "postgres" {
		return "postgres"
	}
	return "mysql"
}

func defaultProducts() []Product {
	return []Product{
		{
			ID:       1,
			Name:     "Ravi Style Sitar",
			Category: "string",
			Price:    45999,
			Details:  "Teak wood, hand-carved jawari",
			Images:   []string{"assets/images/sitar.svg"},
			VideoURL: "assets/videos/sitar-making.mp4",
		},
		{
			ID:       2,
			Name:     "Concert Tabla Set",
			Category: "percussion",
			Price:    28999,
			Details:  "Sheesham dayan + copper bayan",
			Images:   []string{"assets/Tabla/tabla_1.jpg"},
			VideoURL: "assets/videos/tabla-making.mp4",
		},
		{
			ID:       3,
			Name:     "Miraj Tanpura",
			Category: "string",
			Price:    37999,
			Details:  "Female pitch, polished toor wood",
			Images:   []string{"assets/images/tanpura.svg"},
			VideoURL: "assets/videos/harmonium-making.mp4",
		},
		{
			ID:       4,
			Name:     "Bansuri Pro C",
			Category: "wind",
			Price:    3499,
			Details:  "Seasoned bamboo, concert tuning",
			Images:   []string{"assets/images/bansuri.svg"},
			VideoURL: "assets/videos/sitar-making.mp4",
		},
		{
			ID:       5,
			Name:     "Portable Harmonium",
			Category: "keyboard",
			Price:    21999,
			Details:  "9 stopper, coupler, scale changer",
			Images:   []string{"assets/images/harmonium.svg"},
			VideoURL: "assets/videos/harmonium-making.mp4",
		},
		{
			ID:       6,
			Name:     "Pakhawaj Heritage",
			Category: "percussion",
			Price:    31999,
			Details:  "Hand-laced barrel, rich bass",
			Images:   []string{"assets/images/pakhawaj.svg"},
			VideoURL: "assets/videos/tabla-making.mp4",
		},
	}
}

func defaultVideos() []Video {
	return []Video{
		{ID: 1, Title: "Sitar Making Process", URL: "assets/videos/sitar-making.mp4"},
		{ID: 2, Title: "Tabla Skin & Tuning Craft", URL: "assets/videos/tabla-making.mp4"},
		{ID: 3, Title: "Harmonium Reed Setup", URL: "assets/videos/harmonium-making.mp4"},
	}
}

func newMemoryStorage(seed []Product) *MemoryStorage {
	cp := make([]Product, len(seed))
	copy(cp, seed)
	maxID := 0
	for _, p := range cp {
		if p.ID > maxID {
			maxID = p.ID
		}
	}
	seedVideos := defaultVideos()
	cv := make([]Video, len(seedVideos))
	copy(cv, seedVideos)
	maxVideoID := 0
	for _, v := range cv {
		if v.ID > maxVideoID {
			maxVideoID = v.ID
		}
	}
	return &MemoryStorage{
		products:    cp,
		videos:      cv,
		nextProduct: maxID + 1,
		nextVideo:   maxVideoID + 1,
		nextInquiry: 1,
	}
}

func (m *MemoryStorage) ListProducts() ([]Product, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]Product, len(m.products))
	copy(out, m.products)
	return out, nil
}

func (m *MemoryStorage) ListVideos() ([]Video, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]Video, len(m.videos))
	copy(out, m.videos)
	return out, nil
}

func (m *MemoryStorage) CreateVideo(in VideoInput) (Video, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	v := Video{ID: m.nextVideo, Title: in.Title, URL: in.URL}
	m.nextVideo++
	m.videos = append(m.videos, v)
	return v, nil
}

func (m *MemoryStorage) DeleteVideo(id int) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i := range m.videos {
		if m.videos[i].ID == id {
			m.videos = append(m.videos[:i], m.videos[i+1:]...)
			return nil
		}
	}
	return sql.ErrNoRows
}

func (m *MemoryStorage) CreateProduct(in ProductInput) (Product, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	images := make([]string, len(in.Images))
	copy(images, in.Images)
	p := Product{
		ID:       m.nextProduct,
		Name:     in.Name,
		Category: in.Category,
		Price:    in.Price,
		Details:  in.Details,
		Images:   images,
		VideoURL: in.VideoURL,
	}
	m.nextProduct++
	m.products = append(m.products, p)
	return p, nil
}

func (m *MemoryStorage) UpdateProduct(id int, in ProductInput) (Product, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i := range m.products {
		if m.products[i].ID == id {
			m.products[i].Name = in.Name
			m.products[i].Category = in.Category
			m.products[i].Price = in.Price
			m.products[i].Details = in.Details
			m.products[i].Images = make([]string, len(in.Images))
			copy(m.products[i].Images, in.Images)
			m.products[i].VideoURL = in.VideoURL
			return m.products[i], nil
		}
	}
	return Product{}, sql.ErrNoRows
}

func (m *MemoryStorage) DeleteProduct(id int) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i := range m.products {
		if m.products[i].ID == id {
			m.products = append(m.products[:i], m.products[i+1:]...)
			return nil
		}
	}
	return sql.ErrNoRows
}

func (m *MemoryStorage) SaveInquiry(in InquiryRequest) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.inquiries = append(m.inquiries, Inquiry{ID: m.nextInquiry, Name: in.Name, Email: in.Email, Message: in.Message, CreatedAt: time.Now().UTC()})
	m.nextInquiry++
	return nil
}

func (m *MemoryStorage) ListInquiries() ([]Inquiry, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]Inquiry, len(m.inquiries))
	copy(out, m.inquiries)
	return out, nil
}

func (s *SQLStorage) ensureSchema() error {
	queries := schemaQueries(s.vendor)
	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func schemaQueries(vendor string) []string {
	if vendor == "postgres" {
		return []string{
			`CREATE TABLE IF NOT EXISTS products (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				category TEXT NOT NULL,
				price INTEGER NOT NULL,
				details TEXT NOT NULL,
				images_json TEXT NOT NULL DEFAULT '[]',
				video_url TEXT NOT NULL DEFAULT '',
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`,
			`ALTER TABLE products ADD COLUMN IF NOT EXISTS images_json TEXT NOT NULL DEFAULT '[]'`,
			`ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT ''`,
			`CREATE TABLE IF NOT EXISTS videos (
				id SERIAL PRIMARY KEY,
				title TEXT NOT NULL,
				url TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`,
			`CREATE TABLE IF NOT EXISTS inquiries (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				message TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`,
		}
	}
	return []string{
		`CREATE TABLE IF NOT EXISTS products (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(64) NOT NULL,
			price INT NOT NULL,
			details TEXT NOT NULL,
			images_json TEXT NOT NULL,
			video_url TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS images_json TEXT NOT NULL DEFAULT '[]'`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT ''`,
		`CREATE TABLE IF NOT EXISTS videos (
			id INT AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			url TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS inquiries (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
	}
}

func (s *SQLStorage) seedProducts() error {
	var count int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count); err != nil {
		return err
	}
	if count == 0 {
		for _, p := range defaultProducts() {
			if _, err := s.CreateProduct(ProductInput{Name: p.Name, Category: p.Category, Price: p.Price, Details: p.Details}); err != nil {
				return err
			}
		}
	}
	if err := s.seedVideos(); err != nil {
		return err
	}
	return nil
}

func (s *SQLStorage) seedVideos() error {
	var count int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM videos").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	for _, v := range defaultVideos() {
		if _, err := s.CreateVideo(VideoInput{Title: v.Title, URL: v.URL}); err != nil {
			return err
		}
	}
	return nil
}

func (s *SQLStorage) ListProducts() ([]Product, error) {
	rows, err := s.db.Query("SELECT id, name, category, price, details, images_json, video_url FROM products ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Product, 0)
	for rows.Next() {
		var p Product
		var imagesJSON string
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Price, &p.Details, &imagesJSON, &p.VideoURL); err != nil {
			return nil, err
		}
		p.Images = decodeImagesJSON(imagesJSON)
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *SQLStorage) ListVideos() ([]Video, error) {
	rows, err := s.db.Query("SELECT id, title, url FROM videos ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Video, 0)
	for rows.Next() {
		var v Video
		if err := rows.Scan(&v.ID, &v.Title, &v.URL); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

func (s *SQLStorage) CreateVideo(in VideoInput) (Video, error) {
	var id int
	if s.vendor == "postgres" {
		err := s.db.QueryRow(
			"INSERT INTO videos (title, url) VALUES ($1, $2) RETURNING id",
			in.Title, in.URL,
		).Scan(&id)
		if err != nil {
			return Video{}, err
		}
	} else {
		res, err := s.db.Exec(
			"INSERT INTO videos (title, url) VALUES (?, ?)",
			in.Title, in.URL,
		)
		if err != nil {
			return Video{}, err
		}
		lastID, err := res.LastInsertId()
		if err != nil {
			return Video{}, err
		}
		id = int(lastID)
	}
	return Video{ID: id, Title: in.Title, URL: in.URL}, nil
}

func (s *SQLStorage) DeleteVideo(id int) error {
	var res sql.Result
	var err error
	if s.vendor == "postgres" {
		res, err = s.db.Exec("DELETE FROM videos WHERE id = $1", id)
	} else {
		res, err = s.db.Exec("DELETE FROM videos WHERE id = ?", id)
	}
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *SQLStorage) CreateProduct(in ProductInput) (Product, error) {
	var id int
	if s.vendor == "postgres" {
		err := s.db.QueryRow(
			"INSERT INTO products (name, category, price, details, images_json, video_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
			in.Name, in.Category, in.Price, in.Details, encodeImagesJSON(in.Images), in.VideoURL,
		).Scan(&id)
		if err != nil {
			return Product{}, err
		}
	} else {
		res, err := s.db.Exec(
			"INSERT INTO products (name, category, price, details, images_json, video_url) VALUES (?, ?, ?, ?, ?, ?)",
			in.Name, in.Category, in.Price, in.Details, encodeImagesJSON(in.Images), in.VideoURL,
		)
		if err != nil {
			return Product{}, err
		}
		lastID, err := res.LastInsertId()
		if err != nil {
			return Product{}, err
		}
		id = int(lastID)
	}
	return Product{
		ID:       id,
		Name:     in.Name,
		Category: in.Category,
		Price:    in.Price,
		Details:  in.Details,
		Images:   in.Images,
		VideoURL: in.VideoURL,
	}, nil
}

func (s *SQLStorage) UpdateProduct(id int, in ProductInput) (Product, error) {
	var res sql.Result
	var err error
	if s.vendor == "postgres" {
		res, err = s.db.Exec(
			"UPDATE products SET name = $1, category = $2, price = $3, details = $4, images_json = $5, video_url = $6 WHERE id = $7",
			in.Name, in.Category, in.Price, in.Details, encodeImagesJSON(in.Images), in.VideoURL, id,
		)
	} else {
		res, err = s.db.Exec(
			"UPDATE products SET name = ?, category = ?, price = ?, details = ?, images_json = ?, video_url = ? WHERE id = ?",
			in.Name, in.Category, in.Price, in.Details, encodeImagesJSON(in.Images), in.VideoURL, id,
		)
	}
	if err != nil {
		return Product{}, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return Product{}, err
	}
	if affected == 0 {
		return Product{}, sql.ErrNoRows
	}
	return Product{
		ID:       id,
		Name:     in.Name,
		Category: in.Category,
		Price:    in.Price,
		Details:  in.Details,
		Images:   in.Images,
		VideoURL: in.VideoURL,
	}, nil
}

func (s *SQLStorage) DeleteProduct(id int) error {
	var res sql.Result
	var err error
	if s.vendor == "postgres" {
		res, err = s.db.Exec("DELETE FROM products WHERE id = $1", id)
	} else {
		res, err = s.db.Exec("DELETE FROM products WHERE id = ?", id)
	}
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *SQLStorage) SaveInquiry(in InquiryRequest) error {
	if s.vendor == "postgres" {
		_, err := s.db.Exec("INSERT INTO inquiries (name, email, message) VALUES ($1, $2, $3)", in.Name, in.Email, in.Message)
		return err
	}
	_, err := s.db.Exec("INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)", in.Name, in.Email, in.Message)
	return err
}

func (s *SQLStorage) ListInquiries() ([]Inquiry, error) {
	rows, err := s.db.Query("SELECT id, name, email, message, created_at FROM inquiries ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Inquiry, 0)
	for rows.Next() {
		var in Inquiry
		if err := rows.Scan(&in.ID, &in.Name, &in.Email, &in.Message, &in.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, in)
	}
	return out, rows.Err()
}

func newSessionManager(ttl time.Duration) *SessionManager {
	return &SessionManager{sessions: make(map[string]time.Time), ttl: ttl}
}

func (sm *SessionManager) Create() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	token := hex.EncodeToString(buf)
	expires := time.Now().Add(sm.ttl)
	sm.mu.Lock()
	sm.sessions[token] = expires
	sm.mu.Unlock()
	return token, nil
}

func (sm *SessionManager) Valid(token string) bool {
	if token == "" {
		return false
	}
	now := time.Now()
	sm.mu.Lock()
	defer sm.mu.Unlock()
	exp, ok := sm.sessions[token]
	if !ok {
		return false
	}
	if now.After(exp) {
		delete(sm.sessions, token)
		return false
	}
	return true
}

func (sm *SessionManager) Delete(token string) {
	sm.mu.Lock()
	delete(sm.sessions, token)
	sm.mu.Unlock()
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

func (s *Server) handleHealthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) handleHome(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, "index.html")
}

func (s *Server) handleAdminPage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/admin" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, "admin.html")
}

func (s *Server) handleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	products, err := s.store.ListProducts()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load products")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"products": products})
}

func (s *Server) handleVideos(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	videos, err := s.store.ListVideos()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load videos")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"videos": videos})
}

func (s *Server) handleAdminVideos(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	switch r.Method {
	case http.MethodGet:
		videos, err := s.store.ListVideos()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to load videos")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"videos": videos})
	case http.MethodPost:
		var input VideoInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
			return
		}
		input.Title = strings.TrimSpace(input.Title)
		input.URL = strings.TrimSpace(input.URL)
		if input.Title == "" || input.URL == "" {
			writeJSONError(w, http.StatusBadRequest, "title and url are required")
			return
		}
		video, err := s.store.CreateVideo(input)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to create video")
			return
		}
		writeJSON(w, http.StatusCreated, map[string]any{"video": video})
	default:
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *Server) handleAdminVideoByID(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodDelete {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id, err := parseIDFromPath(r.URL.Path, "/api/admin/videos/")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid video id")
		return
	}
	if err := s.store.DeleteVideo(id); errors.Is(err, sql.ErrNoRows) {
		writeJSONError(w, http.StatusNotFound, "video not found")
		return
	} else if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to delete video")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleInquiry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var payload InquiryRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	payload.Name = strings.TrimSpace(payload.Name)
	payload.Email = strings.TrimSpace(payload.Email)
	payload.Message = strings.TrimSpace(payload.Message)

	if payload.Name == "" || payload.Email == "" || payload.Message == "" {
		writeJSONError(w, http.StatusBadRequest, "name, email and message are required")
		return
	}
	if !s.emailRegex.MatchString(payload.Email) {
		writeJSONError(w, http.StatusBadRequest, "invalid email format")
		return
	}

	if err := s.store.SaveInquiry(payload); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save inquiry")
		return
	}
	if err := appendInquiryLog(payload); err != nil {
		log.Printf("failed to write inquiry log: %v", err)
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"status":  "ok",
		"message": "Thanks. We will contact you within 24 hours.",
	})
}

func (s *Server) handleCheckout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	if len(payload.Items) == 0 {
		writeJSONError(w, http.StatusBadRequest, "cart is empty")
		return
	}

	total := 0
	parts := make([]string, 0, len(payload.Items))
	for _, item := range payload.Items {
		name := strings.TrimSpace(item.Name)
		if name == "" || item.Price <= 0 {
			writeJSONError(w, http.StatusBadRequest, "invalid cart item")
			return
		}
		total += item.Price
		parts = append(parts, fmt.Sprintf("%s (Rs %d)", name, item.Price))
	}

	message := fmt.Sprintf("Hello स्वयंवाणी, I want to order: %s. Total: Rs %d.", strings.Join(parts, ", "), total)
	waURL := "https://wa.me/919922317125?text=" + url.QueryEscape(message)
	writeJSON(w, http.StatusOK, map[string]string{"whatsapp_url": waURL})
}

func (s *Server) handleCreateRazorpayOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if s.razorpayKeyID == "" || s.razorpayKeySecret == "" {
		writeJSONError(w, http.StatusBadRequest, "razorpay is not configured")
		return
	}

	var payload RazorpayOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	if len(payload.Items) == 0 {
		writeJSONError(w, http.StatusBadRequest, "cart is empty")
		return
	}

	totalINR := 0
	names := make([]string, 0, len(payload.Items))
	for _, item := range payload.Items {
		name := strings.TrimSpace(item.Name)
		if name == "" || item.Price <= 0 {
			writeJSONError(w, http.StatusBadRequest, "invalid cart item")
			return
		}
		totalINR += item.Price
		names = append(names, name)
	}
	amountPaise := totalINR * 100

	receipt := fmt.Sprintf("svayavani_%d", time.Now().UnixNano())
	rpPayload := map[string]any{
		"amount":   amountPaise,
		"currency": "INR",
		"receipt":  receipt,
		"notes": map[string]string{
			"source": "svayavani",
			"items":  strings.Join(names, ", "),
		},
	}
	body, _ := json.Marshal(rpPayload)

	req, err := http.NewRequest(http.MethodPost, "https://api.razorpay.com/v1/orders", bytes.NewReader(body))
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create payment request")
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(s.razorpayKeyID, s.razorpayKeySecret)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		writeJSONError(w, http.StatusBadGateway, "payment gateway request failed")
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		writeJSONError(w, http.StatusBadGateway, fmt.Sprintf("razorpay error: %s", strings.TrimSpace(string(respBody))))
		return
	}

	var rpResp RazorpayOrderResponse
	if err := json.Unmarshal(respBody, &rpResp); err != nil {
		writeJSONError(w, http.StatusBadGateway, "invalid payment gateway response")
		return
	}
	if rpResp.ID == "" {
		writeJSONError(w, http.StatusBadGateway, "payment order was not created")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"key_id":   s.razorpayKeyID,
		"order_id": rpResp.ID,
		"amount":   rpResp.Amount,
		"currency": rpResp.Currency,
	})
}

func (s *Server) handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload AdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	if strings.TrimSpace(payload.Username) != s.adminUser || strings.TrimSpace(payload.Password) != s.adminPass {
		writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := s.sessions.Create()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((12 * time.Hour).Seconds()),
	})

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleAdminLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	cookie, err := r.Cookie("admin_session")
	if err == nil {
		s.sessions.Delete(cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: "admin_session", Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleAdminMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"username": s.adminUser})
}

func (s *Server) handleCustomerRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload CustomerRegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	payload.Name = strings.TrimSpace(payload.Name)
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	payload.Password = strings.TrimSpace(payload.Password)

	if payload.Name == "" || payload.Email == "" || payload.Password == "" {
		writeJSONError(w, http.StatusBadRequest, "name, email and password are required")
		return
	}
	if !s.emailRegex.MatchString(payload.Email) {
		writeJSONError(w, http.StatusBadRequest, "invalid email format")
		return
	}
	if len(payload.Password) < 6 {
		writeJSONError(w, http.StatusBadRequest, "password must be at least 6 characters")
		return
	}

	s.customerMu.Lock()
	if _, exists := s.customers[payload.Email]; exists {
		s.customerMu.Unlock()
		writeJSONError(w, http.StatusConflict, "customer already exists")
		return
	}
	account := CustomerAccount{
		Name:         payload.Name,
		Email:        payload.Email,
		PasswordHash: hashPassword(payload.Password),
		CreatedAt:    time.Now().UTC(),
	}
	s.customers[payload.Email] = account
	snapshot := s.customerSnapshotLocked()
	s.customerMu.Unlock()

	if err := saveCustomerSnapshot(s.customerDataPath, snapshot); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save customer")
		return
	}

	token, err := s.customerSessions.Create()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	s.setCustomerSessionEmail(token, account.Email)
	setCustomerSessionCookie(w, token)
	writeJSON(w, http.StatusCreated, map[string]any{
		"status": "ok",
		"customer": map[string]string{
			"name":       account.Name,
			"email":      account.Email,
			"created_at": account.CreatedAt.Format(time.RFC3339),
		},
	})
}

func (s *Server) handleCustomerLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload CustomerLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	payload.Password = strings.TrimSpace(payload.Password)
	if payload.Email == "" || payload.Password == "" {
		writeJSONError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	s.customerMu.RLock()
	account, exists := s.customers[payload.Email]
	s.customerMu.RUnlock()
	if !exists || subtle.ConstantTimeCompare([]byte(account.PasswordHash), []byte(hashPassword(payload.Password))) != 1 {
		writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := s.customerSessions.Create()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	s.setCustomerSessionEmail(token, account.Email)
	setCustomerSessionCookie(w, token)
	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"customer": map[string]string{
			"name":       account.Name,
			"email":      account.Email,
			"created_at": account.CreatedAt.Format(time.RFC3339),
		},
	})
}

func (s *Server) handleCustomerLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	cookie, err := r.Cookie("customer_session")
	if err == nil {
		s.customerSessions.Delete(cookie.Value)
		s.deleteCustomerSessionEmail(cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: "customer_session", Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleCustomerMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	s.customerMu.RLock()
	account, exists := s.customers[email]
	s.customerMu.RUnlock()
	if !exists {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"customer": map[string]string{
			"name":       account.Name,
			"email":      account.Email,
			"created_at": account.CreatedAt.Format(time.RFC3339),
		},
	})
}

func (s *Server) handleAdminProducts(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	switch r.Method {
	case http.MethodGet:
		products, err := s.store.ListProducts()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to load products")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"products": products})
	case http.MethodPost:
		var input ProductInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
			return
		}
		norm := normalizeProductInput(input)
		if err := validateProductInput(norm); err != nil {
			writeJSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		product, err := s.store.CreateProduct(norm)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to create product")
			return
		}
		writeJSON(w, http.StatusCreated, map[string]any{"product": product})
	default:
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *Server) handleAdminProductByID(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	id, err := parseIDFromPath(r.URL.Path, "/api/admin/products/")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	switch r.Method {
	case http.MethodPut:
		var input ProductInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
			return
		}
		norm := normalizeProductInput(input)
		if err := validateProductInput(norm); err != nil {
			writeJSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		product, err := s.store.UpdateProduct(id, norm)
		if errors.Is(err, sql.ErrNoRows) {
			writeJSONError(w, http.StatusNotFound, "product not found")
			return
		}
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to update product")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"product": product})
	case http.MethodDelete:
		err := s.store.DeleteProduct(id)
		if errors.Is(err, sql.ErrNoRows) {
			writeJSONError(w, http.StatusNotFound, "product not found")
			return
		}
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to delete product")
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
	default:
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *Server) handleAdminInquiries(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	inquiries, err := s.store.ListInquiries()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load inquiries")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"inquiries": inquiries})
}

func (s *Server) handleAdminCustomers(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.customerMu.RLock()
	customers := make([]map[string]string, 0, len(s.customers))
	for _, account := range s.customers {
		customers = append(customers, map[string]string{
			"name":       account.Name,
			"email":      account.Email,
			"created_at": account.CreatedAt.Format(time.RFC3339),
		})
	}
	s.customerMu.RUnlock()
	writeJSON(w, http.StatusOK, map[string]any{"customers": customers})
}

func (s *Server) handleGetOffers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	s.offerMu.RLock()
	config := s.offerConfig
	s.offerMu.RUnlock()
	writeJSON(w, http.StatusOK, map[string]any{"offers": config})
}

func (s *Server) handleAdminOffers(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var config OfferConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	s.offerMu.Lock()
	s.offerConfig = config
	s.offerMu.Unlock()
	if err := saveOfferConfig(s.offerConfigPath, config); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save offers")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func parseIDFromPath(path, prefix string) (int, error) {
	idStr := strings.TrimPrefix(path, prefix)
	if idStr == "" || strings.Contains(idStr, "/") {
		return 0, errors.New("invalid")
	}
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid")
	}
	return id, nil
}

func normalizeProductInput(in ProductInput) ProductInput {
	in.Name = strings.TrimSpace(in.Name)
	in.Category = strings.ToLower(strings.TrimSpace(in.Category))
	in.Details = strings.TrimSpace(in.Details)
	in.VideoURL = strings.TrimSpace(in.VideoURL)
	images := make([]string, 0, len(in.Images))
	for _, img := range in.Images {
		img = strings.TrimSpace(img)
		if img != "" {
			images = append(images, img)
		}
	}
	in.Images = images
	return in
}

func validateProductInput(in ProductInput) error {
	if in.Name == "" || in.Category == "" || in.Details == "" {
		return errors.New("name, category and details are required")
	}
	if in.Price <= 0 {
		return errors.New("price must be greater than 0")
	}
	if len(in.Category) > 32 {
		return errors.New("category too long")
	}
	if len(in.Images) < 5 {
		return errors.New("minimum 5 product photos are required")
	}
	if in.VideoURL == "" {
		return errors.New("product making video is required")
	}
	return nil
}

func (s *Server) isAdmin(r *http.Request) bool {
	cookie, err := r.Cookie("admin_session")
	if err != nil {
		return false
	}
	return s.sessions.Valid(cookie.Value)
}

func (s *Server) loadCustomers() error {
	accounts, err := loadCustomerAccounts(s.customerDataPath)
	if err != nil {
		return err
	}
	s.customerMu.Lock()
	defer s.customerMu.Unlock()
	for _, account := range accounts {
		s.customers[strings.ToLower(strings.TrimSpace(account.Email))] = account
	}
	return nil
}

func (s *Server) customerSnapshotLocked() []CustomerAccount {
	out := make([]CustomerAccount, 0, len(s.customers))
	for _, account := range s.customers {
		out = append(out, account)
	}
	return out
}

func loadCustomerAccounts(path string) ([]CustomerAccount, error) {
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var accounts []CustomerAccount
	if err := json.Unmarshal(data, &accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

func saveCustomerSnapshot(path string, accounts []CustomerAccount) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	body, err := json.MarshalIndent(accounts, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, body, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func (s *Server) loadOffers() error {
	config, err := loadOfferConfig(s.offerConfigPath)
	if err != nil {
		return err
	}
	s.offerMu.Lock()
	s.offerConfig = config
	s.offerMu.Unlock()
	return nil
}

func loadOfferConfig(path string) (OfferConfig, error) {
	var config OfferConfig
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return config, nil
	}
	if err != nil {
		return config, err
	}
	if err := json.Unmarshal(data, &config); err != nil {
		return config, err
	}
	return config, nil
}

func saveOfferConfig(path string, config OfferConfig) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	body, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, body, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func hashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

func setCustomerSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "customer_session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((12 * time.Hour).Seconds()),
	})
}

func (s *Server) setCustomerSessionEmail(token, email string) {
	s.customerSessionMu.Lock()
	defer s.customerSessionMu.Unlock()
	s.customerSessionTo[token] = email
}

func (s *Server) deleteCustomerSessionEmail(token string) {
	s.customerSessionMu.Lock()
	defer s.customerSessionMu.Unlock()
	delete(s.customerSessionTo, token)
}

func (s *Server) customerEmailFromRequest(r *http.Request) (string, bool) {
	cookie, err := r.Cookie("customer_session")
	if err != nil {
		return "", false
	}
	token := cookie.Value
	if !s.customerSessions.Valid(token) {
		s.deleteCustomerSessionEmail(token)
		return "", false
	}
	s.customerSessionMu.RLock()
	email, ok := s.customerSessionTo[token]
	s.customerSessionMu.RUnlock()
	return email, ok
}

func appendInquiryLog(inquiry InquiryRequest) error {
	if err := os.MkdirAll("data", 0o755); err != nil {
		return err
	}
	path := filepath.Join("data", "inquiries.log")
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer file.Close()

	line := fmt.Sprintf("%s\t%s\t%s\t%s\n", time.Now().Format(time.RFC3339), sanitizeLog(inquiry.Name), sanitizeLog(inquiry.Email), sanitizeLog(inquiry.Message))
	_, err = file.WriteString(line)
	return err
}

func sanitizeLog(v string) string {
	v = strings.ReplaceAll(v, "\t", " ")
	v = strings.ReplaceAll(v, "\n", " ")
	return strings.TrimSpace(v)
}

func encodeImagesJSON(images []string) string {
	b, err := json.Marshal(images)
	if err != nil {
		return "[]"
	}
	return string(b)
}

func decodeImagesJSON(raw string) []string {
	var out []string
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return nil
	}
	return out
}

func writeJSONError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}
