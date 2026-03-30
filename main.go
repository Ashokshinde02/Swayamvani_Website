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
	"swayamvani/orders"
	"sync"
	"time"

	mailer "swayamvani/mailer"

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
	Image string `json:"image"`
}

type CheckoutRequest struct {
	Items   []CheckoutItem `json:"items"`
	Mobile  string         `json:"mobile"`
	Address string         `json:"address"`
}

type OfferConfig struct {
	Title         string `json:"title"`
	Desc          string `json:"desc"`
	DiscountTitle string `json:"discountTitle"`
	DiscountDesc  string `json:"discountDesc"`
	LessonsTitle  string `json:"lessonsTitle"`
	LessonsDesc   string `json:"lessonsDesc"`
	CouponCode    string `json:"couponCode"`
	CouponPercent int    `json:"couponPercent"`
	OfferType     string `json:"offerType"`
	CouponEnabled bool   `json:"couponEnabled"`
}

type OfferEntry struct {
	ID     int         `json:"id"`
	Active bool        `json:"active"`
	Config OfferConfig `json:"config"`
}

type OffersFile struct {
	Offers []OfferEntry `json:"offers"`
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

type CustomerForgotPasswordRequest struct {
	Email string `json:"email"`
}

type CustomerAccount struct {
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	CreatedAt    time.Time `json:"created_at"`
	Mobile       string    `json:"mobile,omitempty"`
	Address      string    `json:"address,omitempty"`
}

type CustomerProfile struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
	Mobile    string `json:"mobile,omitempty"`
	Address   string `json:"address,omitempty"`
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

type Server struct {
	store                Storage
	sqlStore             *SQLStorage
	emailRegex           *regexp.Regexp
	adminUser            string
	adminPass            string
	sessions             *SessionManager
	customerSessions     *SessionManager
	customerMu           sync.RWMutex
	customers            map[string]CustomerAccount
	customerDataPath     string
	ordersStore          *orders.Store
	offerConfig          OfferConfig
	offerList            OffersFile
	offerMu              sync.RWMutex
	offerConfigPath      string
	razorpayKeyID        string
	razorpayKeySecret    string
	sessionSecret        []byte
	passwordResetMu      sync.RWMutex
	pendingPasswordReset map[string]bool
}

func main() {
	store, sqlStore, mode, err := createStorage()
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
		store:                store,
		sqlStore:             sqlStore,
		emailRegex:           regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`),
		adminUser:            adminUser,
		adminPass:            adminPass,
		sessions:             newSessionManager(12 * time.Hour),
		customerSessions:     newSessionManager(12 * time.Hour),
		customers:            make(map[string]CustomerAccount),
		customerDataPath:     filepath.Join("data", "customers.json"),
		ordersStore:          orders.NewStore(filepath.Join("data")),
		offerConfigPath:      filepath.Join("data", "offers.json"),
		razorpayKeyID:        strings.TrimSpace(os.Getenv("RAZORPAY_KEY_ID")),
		razorpayKeySecret:    strings.TrimSpace(os.Getenv("RAZORPAY_KEY_SECRET")),
		sessionSecret:        loadSessionSecret(),
		pendingPasswordReset: make(map[string]bool),
	}
	if err := s.loadCustomers(); err != nil {
		log.Printf("warning: failed to load customers file: %v", err)
	}
	if err := s.loadOffers(); err != nil {
		log.Printf("warning: failed to load offers file: %v", err)
	}
	if err := s.loadCustomers(); err != nil {
		log.Printf("warning: failed to load customers: %v", err)
	}
	if err := s.ordersStore.Load(); err != nil {
		log.Printf("warning: failed to load orders: %v", err)
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
	mux.HandleFunc("/api/customer/forgot-password", s.handleCustomerForgotPassword)
	mux.HandleFunc("/api/customer/logout", s.handleCustomerLogout)
	mux.HandleFunc("/api/customer/update-password", s.handleCustomerUpdatePassword)
	mux.HandleFunc("/api/customer/me", s.handleCustomerMe)
	mux.HandleFunc("/api/customer/profile", s.handleCustomerProfile)
	mux.HandleFunc("/api/customer/orders", s.handleCustomerOrders)
	mux.HandleFunc("/api/offers", s.handleGetOffers)
	mux.HandleFunc("/api/coupon/use", s.handleCouponUse)
	mux.HandleFunc("/api/admin/offers", s.handleAdminOffers)
	mux.HandleFunc("/api/admin/orders", s.handleAdminOrders)
	mux.HandleFunc("/api/admin/products", s.handleAdminProducts)
	mux.HandleFunc("/api/admin/products/", s.handleAdminProductByID)
	mux.HandleFunc("/api/admin/videos", s.handleAdminVideos)
	mux.HandleFunc("/api/admin/videos/", s.handleAdminVideoByID)
	mux.HandleFunc("/api/admin/inquiries", s.handleAdminInquiries)
	mux.HandleFunc("/api/admin/orders/", s.handleAdminOrderStatus)
	mux.HandleFunc("/api/admin/customers", s.handleAdminCustomers)
	mux.HandleFunc("/admin", s.handleAdminPage)
	mux.HandleFunc("/", s.handleHome)
	mux.Handle("/styles.css", http.FileServer(http.Dir(".")))
	mux.Handle("/script.js", http.FileServer(http.Dir(".")))
	mux.Handle("/demo.js", http.FileServer(http.Dir(".")))
	mux.Handle("/admin.js", http.FileServer(http.Dir(".")))
	mux.Handle("/offer/", http.StripPrefix("/", http.FileServer(http.Dir("."))))
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

func createStorage() (Storage, *SQLStorage, string, error) {
	vendor := strings.ToLower(strings.TrimSpace(os.Getenv("DB_VENDOR")))
	dsn := strings.TrimSpace(os.Getenv("DB_DSN"))

	if vendor == "" || dsn == "" {
		m := newMemoryStorage(defaultProducts())
		return m, nil, "memory", nil
	}
	if vendor != "postgres" && vendor != "mysql" {
		return nil, nil, "", fmt.Errorf("DB_VENDOR must be postgres or mysql")
	}

	db, err := sql.Open(dbDriver(vendor), dsn)
	if err != nil {
		return nil, nil, "", err
	}
	if err := db.Ping(); err != nil {
		return nil, nil, "", err
	}

	sqlStore := &SQLStorage{db: db, vendor: vendor}
	if err := sqlStore.ensureSchema(); err != nil {
		return nil, nil, "", err
	}
	if err := sqlStore.seedProducts(); err != nil {
		return nil, nil, "", err
	}
	return sqlStore, sqlStore, vendor, nil
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
			// Ignore duplicate column/index errors to keep migrations idempotent on MySQL
			if strings.Contains(err.Error(), "Duplicate column name") || strings.Contains(err.Error(), "Duplicate key name") {
				continue
			}
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
			`ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'`,
			`ALTER TABLE products ADD COLUMN video_url TEXT NOT NULL DEFAULT ''`,
			`CREATE TABLE videos (
				id SERIAL PRIMARY KEY,
				title TEXT NOT NULL,
				url TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`,
			`CREATE TABLE inquiries (
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					email TEXT NOT NULL,
					message TEXT NOT NULL,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)`,
			`CREATE TABLE IF NOT EXISTS customers (
					id SERIAL PRIMARY KEY,
					name TEXT NOT NULL,
					email TEXT NOT NULL UNIQUE,
					password_hash TEXT NOT NULL,
					mobile TEXT NOT NULL DEFAULT '',
					address TEXT NOT NULL DEFAULT '',
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)`,
			`ALTER TABLE customers ADD COLUMN mobile TEXT NOT NULL DEFAULT ''`,
			`ALTER TABLE customers ADD COLUMN address TEXT NOT NULL DEFAULT ''`,
			`CREATE TABLE IF NOT EXISTS orders (
					id SERIAL PRIMARY KEY,
					customer_email TEXT NOT NULL,
					customer_name TEXT NOT NULL DEFAULT '',
					items_json JSONB NOT NULL,
					total INTEGER NOT NULL,
					status TEXT NOT NULL,
					payment_ref TEXT NOT NULL DEFAULT '',
					mobile TEXT NOT NULL DEFAULT '',
					address TEXT NOT NULL DEFAULT '',
					metadata JSONB,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)`,
			`ALTER TABLE orders ADD COLUMN mobile TEXT NOT NULL DEFAULT ''`,
			`ALTER TABLE orders ADD COLUMN address TEXT NOT NULL DEFAULT ''`,
			`ALTER TABLE orders ADD COLUMN customer_name TEXT NOT NULL DEFAULT ''`,
			`CREATE TABLE IF NOT EXISTS offers (
						id SERIAL PRIMARY KEY,
						active BOOLEAN NOT NULL DEFAULT FALSE,
						offer_type TEXT NOT NULL,
						title TEXT NOT NULL,
					descr TEXT NOT NULL,
					discount_title TEXT NOT NULL DEFAULT '',
					discount_desc TEXT NOT NULL DEFAULT '',
					lessons_title TEXT NOT NULL DEFAULT '',
					lessons_desc TEXT NOT NULL DEFAULT '',
					coupon_code TEXT NOT NULL DEFAULT '',
					coupon_percent INT NOT NULL DEFAULT 0,
					coupon_enabled BOOLEAN NOT NULL DEFAULT TRUE,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)`,
			`ALTER TABLE offers ADD COLUMN coupon_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
			`CREATE INDEX idx_offers_active ON offers(active)`,
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
			video_url VARCHAR(255) NOT NULL DEFAULT '',
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
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
		`CREATE TABLE IF NOT EXISTS customers (
					id INT AUTO_INCREMENT PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					email VARCHAR(255) NOT NULL UNIQUE,
					password_hash VARCHAR(255) NOT NULL,
					mobile VARCHAR(32) NOT NULL DEFAULT '',
					address VARCHAR(512) NOT NULL DEFAULT '',
					created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
				)`,
		`ALTER TABLE customers ADD COLUMN mobile VARCHAR(32) NOT NULL DEFAULT ''`,
		`ALTER TABLE customers ADD COLUMN address VARCHAR(512) NOT NULL DEFAULT ''`,
		`CREATE TABLE IF NOT EXISTS orders (
				id INT AUTO_INCREMENT PRIMARY KEY,
				customer_email VARCHAR(255) NOT NULL,
				customer_name VARCHAR(255) NOT NULL DEFAULT '',
				items_json JSON NOT NULL,
				total INT NOT NULL,
				status VARCHAR(32) NOT NULL,
				payment_ref VARCHAR(255) NOT NULL DEFAULT '',
				mobile VARCHAR(32) NOT NULL DEFAULT '',
				address TEXT NOT NULL,
				metadata JSON NULL,
				created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				INDEX idx_orders_customer_email (customer_email)
			)`,
		`ALTER TABLE orders ADD COLUMN mobile VARCHAR(32) NOT NULL DEFAULT ''`,
		`ALTER TABLE orders ADD COLUMN address TEXT NOT NULL`,
		`ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT ''`,
		`CREATE TABLE IF NOT EXISTS offers (
				id INT AUTO_INCREMENT PRIMARY KEY,
				active BOOLEAN NOT NULL DEFAULT FALSE,
				offer_type VARCHAR(20) NOT NULL,
				title VARCHAR(255) NOT NULL,
			descr TEXT NOT NULL,
			discount_title VARCHAR(255) NOT NULL DEFAULT '',
			discount_desc TEXT NOT NULL,
			lessons_title VARCHAR(255) NOT NULL DEFAULT '',
			lessons_desc TEXT NOT NULL,
			coupon_code VARCHAR(64) NOT NULL DEFAULT '',
			coupon_percent INT NOT NULL DEFAULT 0,
			coupon_enabled BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
		`ALTER TABLE offers ADD COLUMN coupon_enabled BOOLEAN NOT NULL DEFAULT TRUE`,
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
	if err := s.seedOffers(); err != nil {
		return err
	}
	if err := s.seedCustomers(); err != nil {
		return err
	}
	return nil
}

func (s *SQLStorage) seedOffers() error {
	var count int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM offers").Scan(&count); err != nil {
		return err
	}
	// Always upsert the two baseline offers in MySQL so they exist for admin editing.
	if s.vendor == "mysql" {
		_, _ = s.db.Exec(`
			INSERT INTO offers
			(id, active, offer_type, title, descr, discount_title, discount_desc, lessons_title, lessons_desc, coupon_code, coupon_percent)
			VALUES
			(1, TRUE, 'discount', '10% off every instrument',
			 'Logged-in shoppers receive automatic 10% savings on each instrument in their cart.',
			 '10% off every instrument',
			 'Logged-in shoppers receive automatic 10% savings on each instrument in their cart.',
			 '', '', '', 0)
			ON DUPLICATE KEY UPDATE
				active=VALUES(active),
				offer_type=VALUES(offer_type),
				title=VALUES(title),
				descr=VALUES(descr),
				discount_title=VALUES(discount_title),
				discount_desc=VALUES(discount_desc),
				lessons_title=VALUES(lessons_title),
				lessons_desc=VALUES(lessons_desc),
				coupon_code=VALUES(coupon_code),
				coupon_percent=VALUES(coupon_percent)
		`)
		_, _ = s.db.Exec(`
			INSERT INTO offers
			(id, active, offer_type, title, descr, discount_title, discount_desc, lessons_title, lessons_desc, coupon_code, coupon_percent)
			VALUES
			(2, FALSE, 'lessons', 'First 4 lessons free',
			 'After purchase, unlock four complimentary one-on-one learning sessions with our expert musicians.',
			 '', '',
			 'First 4 lessons free',
			 'After purchase, unlock four complimentary one-on-one learning sessions with our expert musicians.',
			 '', 0)
			ON DUPLICATE KEY UPDATE
				active=VALUES(active),
				offer_type=VALUES(offer_type),
				title=VALUES(title),
				descr=VALUES(descr),
				discount_title=VALUES(discount_title),
				discount_desc=VALUES(discount_desc),
				lessons_title=VALUES(lessons_title),
				lessons_desc=VALUES(lessons_desc),
				coupon_code=VALUES(coupon_code),
				coupon_percent=VALUES(coupon_percent)
		`)
		// Ensure only offer 1 is active
		_, _ = s.db.Exec("UPDATE offers SET active = (id = 1)")
		return nil
	}

	if count == 0 {
		_, _ = s.UpsertOffer(0, OfferConfig{
			OfferType:     "discount",
			Title:         "10% off every instrument",
			Desc:          "Logged-in shoppers receive automatic 10% savings on each instrument in their cart.",
			DiscountTitle: "10% off every instrument",
			DiscountDesc:  "Logged-in shoppers receive automatic 10% savings on each instrument in their cart.",
			CouponEnabled: true,
		})
		_, _ = s.UpsertOffer(0, OfferConfig{
			OfferType:     "lessons",
			Title:         "First 4 lessons free",
			Desc:          "After purchase, unlock four complimentary one-on-one learning sessions with our expert musicians.",
			LessonsTitle:  "First 4 lessons free",
			LessonsDesc:   "After purchase, unlock four complimentary one-on-one learning sessions with our expert musicians.",
			CouponEnabled: true,
		})
		_ = s.ActivateOffer(1)
	}
	return nil
}

func (s *SQLStorage) seedCustomers() error {
	// no-op seeding; customers are user-created. Keep placeholder for symmetry.
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

func (s *SQLStorage) ListOffers() ([]OfferEntry, error) {
	rows, err := s.db.Query("SELECT id, active, offer_type, title, descr, discount_title, discount_desc, lessons_title, lessons_desc, coupon_code, coupon_percent, coupon_enabled FROM offers ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []OfferEntry{}
	for rows.Next() {
		var entry OfferEntry
		var cfg OfferConfig
		if err := rows.Scan(&entry.ID, &entry.Active, &cfg.OfferType, &cfg.Title, &cfg.Desc, &cfg.DiscountTitle, &cfg.DiscountDesc, &cfg.LessonsTitle, &cfg.LessonsDesc, &cfg.CouponCode, &cfg.CouponPercent, &cfg.CouponEnabled); err != nil {
			return nil, err
		}
		entry.Config = cfg
		out = append(out, entry)
	}
	return out, nil
}

func (s *SQLStorage) UpsertOffer(id int, cfg OfferConfig) (int, error) {
	if id == 0 {
		res, err := s.db.Exec(`INSERT INTO offers (active, offer_type, title, descr, discount_title, discount_desc, lessons_title, lessons_desc, coupon_code, coupon_percent, coupon_enabled) VALUES (FALSE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			cfg.OfferType, cfg.Title, cfg.Desc, cfg.DiscountTitle, cfg.DiscountDesc, cfg.LessonsTitle, cfg.LessonsDesc, cfg.CouponCode, cfg.CouponPercent, cfg.CouponEnabled)
		if err != nil {
			return 0, err
		}
		newID, _ := res.LastInsertId()
		return int(newID), nil
	}
	_, err := s.db.Exec(`UPDATE offers SET offer_type=?, title=?, descr=?, discount_title=?, discount_desc=?, lessons_title=?, lessons_desc=?, coupon_code=?, coupon_percent=?, coupon_enabled=? WHERE id=?`,
		cfg.OfferType, cfg.Title, cfg.Desc, cfg.DiscountTitle, cfg.DiscountDesc, cfg.LessonsTitle, cfg.LessonsDesc, cfg.CouponCode, cfg.CouponPercent, cfg.CouponEnabled, id)
	return id, err
}

func (s *SQLStorage) ActivateOffer(id int) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec("UPDATE offers SET active=FALSE"); err != nil {
		return err
	}
	res, err := tx.Exec("UPDATE offers SET active=TRUE WHERE id=?", id)
	if err != nil {
		return err
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return errors.New("offer not found")
	}
	return tx.Commit()
}

func (s *SQLStorage) DeleteOffer(id int) error {
	_, err := s.db.Exec("DELETE FROM offers WHERE id=?", id)
	return err
}

func (s *SQLStorage) ActiveOffer() (OfferConfig, []OfferEntry, error) {
	list, err := s.ListOffers()
	if err != nil {
		return OfferConfig{}, nil, err
	}
	active := OfferConfig{}
	foundActive := false
	for _, entry := range list {
		if entry.Active {
			active = entry.Config
			foundActive = true
			break
		}
	}
	if !foundActive && len(list) > 0 {
		active = list[0].Config
		// best-effort: mark first as active
		_, _ = s.db.Exec("UPDATE offers SET active = (id = ?)", list[0].ID)
	}
	return active, list, nil
}

// Customer persistence for SQLStorage

func (s *SQLStorage) GetCustomerByEmail(email string) (CustomerAccount, error) {
	var account CustomerAccount
	var err error
	if s.vendor == "postgres" {
		err = s.db.QueryRow("SELECT name, email, password_hash, created_at, COALESCE(mobile, ''), COALESCE(address, '') FROM customers WHERE email = $1", email).
			Scan(&account.Name, &account.Email, &account.PasswordHash, &account.CreatedAt, &account.Mobile, &account.Address)
	} else {
		err = s.db.QueryRow("SELECT name, email, password_hash, created_at, COALESCE(mobile, ''), COALESCE(address, '') FROM customers WHERE email = ?", email).
			Scan(&account.Name, &account.Email, &account.PasswordHash, &account.CreatedAt, &account.Mobile, &account.Address)
	}
	return account, err
}

func (s *SQLStorage) CreateCustomer(account CustomerAccount) error {
	if s.vendor == "postgres" {
		_, err := s.db.Exec(`INSERT INTO customers (name, email, password_hash, created_at, mobile, address) VALUES ($1,$2,$3,$4,$5,$6)`,
			account.Name, account.Email, account.PasswordHash, account.CreatedAt, account.Mobile, account.Address)
		return err
	}
	_, err := s.db.Exec(`INSERT INTO customers (name, email, password_hash, created_at, mobile, address) VALUES (?,?,?,?,?,?)`,
		account.Name, account.Email, account.PasswordHash, account.CreatedAt, account.Mobile, account.Address)
	return err
}

func (s *SQLStorage) ListCustomers() ([]CustomerAccount, error) {
	rows, err := s.db.Query("SELECT name, email, password_hash, created_at, COALESCE(mobile, ''), COALESCE(address, '') FROM customers ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []CustomerAccount
	for rows.Next() {
		var a CustomerAccount
		if err := rows.Scan(&a.Name, &a.Email, &a.PasswordHash, &a.CreatedAt, &a.Mobile, &a.Address); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, nil
}

func (s *SQLStorage) UpdateCustomerPassword(email, hash string) error {
	if s.vendor == "postgres" {
		_, err := s.db.Exec("UPDATE customers SET password_hash = $1 WHERE email = $2", hash, email)
		return err
	}
	_, err := s.db.Exec("UPDATE customers SET password_hash = ? WHERE email = ?", hash, email)
	return err
}

func (s *SQLStorage) UpdateCustomerProfile(oldEmail string, account CustomerAccount) error {
	if s.vendor == "postgres" {
		_, err := s.db.Exec("UPDATE customers SET name=$1, email=$2, mobile=$3, address=$4 WHERE email=$5",
			account.Name, account.Email, account.Mobile, account.Address, oldEmail)
		return err
	}
	_, err := s.db.Exec("UPDATE customers SET name=?, email=?, mobile=?, address=? WHERE email=?",
		account.Name, account.Email, account.Mobile, account.Address, oldEmail)
	return err
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

// Orders
func (s *SQLStorage) CreateOrder(email, name string, items []orders.Item, total int, status, paymentRef, mobile, address string, metadata map[string]any) (orders.Order, error) {
	itemsJSON, _ := json.Marshal(items)
	metaJSON, _ := json.Marshal(metadata)

	if s.vendor == "postgres" {
		row := s.db.QueryRow(`
			INSERT INTO orders (customer_email, customer_name, items_json, total, status, payment_ref, mobile, address, metadata)
			VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9::jsonb)
			RETURNING id, created_at
		`, email, name, string(itemsJSON), total, status, paymentRef, mobile, address, string(metaJSON))
		var id int
		var created time.Time
		if err := row.Scan(&id, &created); err != nil {
			return orders.Order{}, err
		}
		return orders.Order{
			ID:            id,
			CustomerEmail: email,
			CustomerName:  name,
			Items:         items,
			Total:         total,
			Status:        status,
			PaymentRef:    paymentRef,
			Mobile:        mobile,
			Address:       address,
			Metadata:      metadata,
			CreatedAt:     created,
		}, nil
	}

	res, err := s.db.Exec(`
		INSERT INTO orders (customer_email, customer_name, items_json, total, status, payment_ref, mobile, address, metadata, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
	`, email, name, string(itemsJSON), total, status, paymentRef, mobile, address, string(metaJSON))
	if err != nil {
		return orders.Order{}, err
	}
	id64, _ := res.LastInsertId()
	return orders.Order{
		ID:            int(id64),
		CustomerEmail: email,
		CustomerName:  name,
		Items:         items,
		Total:         total,
		Status:        status,
		PaymentRef:    paymentRef,
		Mobile:        mobile,
		Address:       address,
		Metadata:      metadata,
		CreatedAt:     time.Now(),
	}, nil
}

func (s *SQLStorage) ListOrdersByEmail(email string) ([]orders.Order, error) {
	query := `
		SELECT id, items_json, total, status, payment_ref, mobile, address, customer_name, metadata, created_at
		FROM orders WHERE customer_email = ?
		ORDER BY created_at DESC
	`
	args := []any{email}
	if s.vendor == "postgres" {
		query = `
			SELECT id, items_json, total, status, payment_ref, mobile, address, customer_name, metadata, created_at
			FROM orders WHERE customer_email = $1
			ORDER BY created_at DESC
		`
	}
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []orders.Order
	for rows.Next() {
		var (
			id           int
			itemsJSON    string
			total        int
			status       string
			paymentRef   string
			mobile       string
			address      string
			customerName string
			metaJSON     sql.NullString
			created      time.Time
		)
		if err := rows.Scan(&id, &itemsJSON, &total, &status, &paymentRef, &mobile, &address, &customerName, &metaJSON, &created); err != nil {
			return nil, err
		}
		var items []orders.Item
		_ = json.Unmarshal([]byte(itemsJSON), &items)
		var metadata map[string]any
		if metaJSON.Valid {
			_ = json.Unmarshal([]byte(metaJSON.String), &metadata)
		}
		out = append(out, orders.Order{
			ID:            id,
			CustomerEmail: email,
			CustomerName:  customerName,
			Items:         items,
			Total:         total,
			Status:        status,
			PaymentRef:    paymentRef,
			Mobile:        mobile,
			Address:       address,
			Metadata:      metadata,
			CreatedAt:     created,
		})
	}
	return out, nil
}

func (s *SQLStorage) LastOrderByEmail(email string) (orders.Order, bool, error) {
	query := `
		SELECT id, items_json, total, status, payment_ref, mobile, address, customer_name, metadata, created_at
		FROM orders WHERE customer_email = ?
		ORDER BY created_at DESC
		LIMIT 1
	`
	args := []any{email}
	if s.vendor == "postgres" {
		query = `
			SELECT id, items_json, total, status, payment_ref, mobile, address, customer_name, metadata, created_at
			FROM orders WHERE customer_email = $1
			ORDER BY created_at DESC
			LIMIT 1
		`
	}
	row := s.db.QueryRow(query, args...)
	var (
		id           int
		itemsJSON    string
		total        int
		status       string
		paymentRef   string
		mobile       string
		address      string
		customerName string
		metaJSON     sql.NullString
		created      time.Time
	)
	if err := row.Scan(&id, &itemsJSON, &total, &status, &paymentRef, &mobile, &address, &customerName, &metaJSON, &created); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return orders.Order{}, false, nil
		}
		return orders.Order{}, false, err
	}
	var items []orders.Item
	_ = json.Unmarshal([]byte(itemsJSON), &items)
	var metadata map[string]any
	if metaJSON.Valid {
		_ = json.Unmarshal([]byte(metaJSON.String), &metadata)
	}
	return orders.Order{
		ID:            id,
		CustomerEmail: email,
		CustomerName:  customerName,
		Items:         items,
		Total:         total,
		Status:        status,
		PaymentRef:    paymentRef,
		Mobile:        mobile,
		Address:       address,
		Metadata:      metadata,
		CreatedAt:     created,
	}, true, nil
}

func (s *SQLStorage) UpdateOrderStatus(id int, status string) error {
	if s.vendor == "postgres" {
		_, err := s.db.Exec("UPDATE orders SET status = $1 WHERE id = $2", status, id)
		return err
	}
	_, err := s.db.Exec("UPDATE orders SET status = ? WHERE id = ?", status, id)
	return err
}

func (s *SQLStorage) ListOrders(statuses []string) ([]orders.Order, error) {
	base := `
		SELECT id, customer_email, customer_name, items_json, total, status, payment_ref, mobile, address, metadata, created_at
		FROM orders
	`
	var rows *sql.Rows
	var err error

	if len(statuses) > 0 {
		placeholders := make([]string, len(statuses))
		args := make([]any, len(statuses))
		for i, st := range statuses {
			args[i] = st
			if s.vendor == "postgres" {
				placeholders[i] = fmt.Sprintf("$%d", i+1)
			} else {
				placeholders[i] = "?"
			}
		}
		ph := strings.Join(placeholders, ",")
		query := base + ` WHERE status IN (` + ph + `) ORDER BY created_at DESC`
		rows, err = s.db.Query(query, args...)
	} else {
		rows, err = s.db.Query(base + ` ORDER BY created_at DESC`)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []orders.Order
	for rows.Next() {
		var (
			id           int
			email        string
			customerName string
			itemsJSON    string
			total        int
			statusVal    string
			paymentRef   string
			mobile       string
			address      string
			metaJSON     sql.NullString
			created      time.Time
		)
		if err := rows.Scan(&id, &email, &customerName, &itemsJSON, &total, &statusVal, &paymentRef, &mobile, &address, &metaJSON, &created); err != nil {
			return nil, err
		}
		var items []orders.Item
		_ = json.Unmarshal([]byte(itemsJSON), &items)
		var metadata map[string]any
		if metaJSON.Valid {
			_ = json.Unmarshal([]byte(metaJSON.String), &metadata)
		}
		out = append(out, orders.Order{
			ID:            id,
			CustomerEmail: email,
			CustomerName:  customerName,
			Items:         items,
			Total:         total,
			Status:        statusVal,
			PaymentRef:    paymentRef,
			Mobile:        mobile,
			Address:       address,
			Metadata:      metadata,
			CreatedAt:     created,
		})
	}
	return out, nil
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

func (s *Server) handleCouponUse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload struct {
		Code  string `json:"code"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	code := strings.TrimSpace(payload.Code)
	if code == "" {
		writeJSONError(w, http.StatusBadRequest, "invalid coupon code")
		return
	}
	active, _, err := s.currentOffers()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load offers")
		return
	}
	if !active.CouponEnabled || active.CouponCode == "" || active.CouponPercent <= 0 {
		writeJSONError(w, http.StatusBadRequest, "coupon unavailable")
		return
	}
	if !strings.EqualFold(code, active.CouponCode) {
		writeJSONError(w, http.StatusBadRequest, "invalid coupon code")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
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
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "please login before checkout")
		return
	}
	var payload CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	payload.Mobile = strings.TrimSpace(payload.Mobile)
	payload.Address = strings.TrimSpace(payload.Address)
	if payload.Mobile == "" || payload.Address == "" {
		writeJSONError(w, http.StatusBadRequest, "mobile and address are required")
		return
	}
	if len(payload.Items) == 0 {
		writeJSONError(w, http.StatusBadRequest, "cart is empty")
		return
	}
	accountName := ""
	if acc, ok := s.customerAccountByEmail(email); ok {
		accountName = acc.Name
	}
	if accountName == "" {
		accountName = strings.Split(email, "@")[0]
	}

	total := 0
	lines := make([]string, 0, len(payload.Items))
	for _, item := range payload.Items {
		name := strings.TrimSpace(item.Name)
		if name == "" || item.Price <= 0 {
			writeJSONError(w, http.StatusBadRequest, "invalid cart item")
			return
		}
		total += item.Price
		img := strings.TrimSpace(item.Image)
		if img != "" {
			lines = append(lines, fmt.Sprintf("%s (Rs %d)\nImage: %s", name, item.Price, img))
		} else {
			lines = append(lines, fmt.Sprintf("%s (Rs %d)", name, item.Price))
		}
	}

	orderItems := make([]orders.Item, 0, len(payload.Items))
	for _, it := range payload.Items {
		orderItems = append(orderItems, orders.Item{Name: it.Name, Price: it.Price, Image: it.Image})
	}
	order, err := s.createOrder(email, accountName, orderItems, total, "pending", "", payload.Mobile, payload.Address, map[string]any{"channel": "whatsapp"})
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save order")
		return
	}
	brandLine := "Swayamvani — Indian Classical Instruments\nwww.swayamvani.com\nLogo: https://www.swayamvani.com/logo.jpeg"
	message := fmt.Sprintf(
		"%s\n\nNew order\nOrder #: %d\nName: %s\nEmail: %s\nMobile: %s\nAddress: %s\n\nItems:\n%s\n\nTotal: Rs %d",
		brandLine,
		order.ID,
		accountName,
		email,
		payload.Mobile,
		payload.Address,
		strings.Join(lines, "\n\n"),
		total,
	)
	waURL := "https://wa.me/917020705968?text=" + url.QueryEscape(message)
	writeJSON(w, http.StatusOK, map[string]any{"whatsapp_url": waURL, "order": order})
}

func (s *Server) handleCreateRazorpayOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "please login before checkout")
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
	// Razorpay path reuses checkout payload for items only; mobile/address expected via /api/checkout.
	if len(payload.Items) == 0 {
		writeJSONError(w, http.StatusBadRequest, "cart is empty")
		return
	}
	accountName := ""
	if acc, ok := s.customerAccountByEmail(email); ok {
		accountName = acc.Name
	}
	if accountName == "" {
		accountName = strings.Split(email, "@")[0]
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

	orderItems := make([]orders.Item, 0, len(payload.Items))
	for _, it := range payload.Items {
		orderItems = append(orderItems, orders.Item{Name: it.Name, Price: it.Price})
	}
	if _, err := s.createOrder(email, accountName, orderItems, totalINR, "pending_payment", rpResp.ID, "", "", map[string]any{"channel": "razorpay"}); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save order")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"key_id":   s.razorpayKeyID,
		"order_id": rpResp.ID,
		"amount":   rpResp.Amount,
		"currency": rpResp.Currency,
	})
}

func (s *Server) createOrder(email, name string, items []orders.Item, total int, status, paymentRef, mobile, address string, metadata map[string]any) (orders.Order, error) {
	if s.sqlStore != nil {
		return s.sqlStore.CreateOrder(email, name, items, total, status, paymentRef, mobile, address, metadata)
	}
	return s.ordersStore.Add(email, name, items, total, status, paymentRef, mobile, address, metadata)
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

	rawPassword := payload.Password
	account := CustomerAccount{
		Name:         payload.Name,
		Email:        payload.Email,
		PasswordHash: hashPassword(payload.Password),
		CreatedAt:    time.Now().UTC(),
	}
	if s.sqlStore != nil {
		if _, err := s.sqlStore.GetCustomerByEmail(account.Email); err == nil {
			writeJSONError(w, http.StatusConflict, "customer already exists")
			return
		}
		if err := s.sqlStore.CreateCustomer(account); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to save customer")
			return
		}
	} else {
		s.customerMu.Lock()
		if _, exists := s.customers[payload.Email]; exists {
			s.customerMu.Unlock()
			writeJSONError(w, http.StatusConflict, "customer already exists")
			return
		}
		s.customers[payload.Email] = account
		snapshot := s.customerSnapshotLocked()
		s.customerMu.Unlock()
		if err := saveCustomerSnapshot(s.customerDataPath, snapshot); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to save customer")
			return
		}
	}

	swayamVaniLogo := "/logo.jpeg"
	subject := "Welcome to Swayamvani! Your Account Has Been Created"
	emailBody := mailer.CreateEmailBody(swayamVaniLogo, account.Name, account.Email, rawPassword)
	if _, err := mailer.SendMail(account.Name, account.Email, subject, emailBody); err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to send welcome email")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"status":  "ok",
		"message": "account created",
	})
}

func (s *Server) handleCustomerLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("In login")
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload CustomerLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		fmt.Println("invalid Json payload")
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	fmt.Println("payload", payload)
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	payload.Password = strings.TrimSpace(payload.Password)
	if payload.Email == "" || payload.Password == "" {
		fmt.Println("Email and password required")
		writeJSONError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	var account CustomerAccount
	var err error
	if s.sqlStore != nil {
		account, err = s.sqlStore.GetCustomerByEmail(payload.Email)
		if err != nil {
			writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
	} else {
		s.customerMu.RLock()
		var exists bool
		account, exists = s.customers[payload.Email]
		s.customerMu.RUnlock()
		if !exists {
			writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
	}
	if subtle.ConstantTimeCompare([]byte(account.PasswordHash), []byte(hashPassword(payload.Password))) != 1 {
		writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := s.issueCustomerToken(account.Email)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	setCustomerSessionCookie(w, token)
	shippingMobile, shippingAddress := s.latestShippingForCustomer(account.Email)
	requiresUpdate := s.isPasswordResetRequired(account.Email)
	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"customer": CustomerProfile{
			Name:      account.Name,
			Email:     account.Email,
			CreatedAt: account.CreatedAt.Format(time.RFC3339),
			Mobile:    firstNonEmpty(account.Mobile, shippingMobile),
			Address:   firstNonEmpty(account.Address, shippingAddress),
		},
		"updateRequired": requiresUpdate,
	})
}

func (s *Server) handleCustomerForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var payload CustomerForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	email := strings.ToLower(strings.TrimSpace(payload.Email))
	if email == "" || !s.emailRegex.MatchString(email) {
		writeJSONError(w, http.StatusBadRequest, "valid email is required")
		return
	}

	account, ok := s.customerAccountByEmail(email)
	if !ok {
		writeJSON(w, http.StatusOK, map[string]any{
			"status":  "ok",
			"message": "password reset request received",
		})
		return
	}

	newPassword := generateTemporaryPassword()
	if err := s.updateCustomerPassword(email, hashPassword(newPassword)); err != nil {
		log.Printf("forgot password update: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "failed to reset password")
		return
	}

	if err := s.sendPasswordResetEmail(account, newPassword); err != nil {
		log.Printf("forgot password email: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "failed to send reset email")
		return
	}

	s.markPasswordResetRequired(email)

	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"message": "password reset email sent",
	})
}

type CustomerUpdatePasswordRequest struct {
	Password string `json:"password"`
}

type CustomerProfileUpdateRequest struct {
	Email   string `json:"email"`
	Mobile  string `json:"mobile"`
	Address string `json:"address"`
}

func (s *Server) handleCustomerUpdatePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var payload CustomerUpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	newPassword := strings.TrimSpace(payload.Password)
	if len(newPassword) < 6 {
		writeJSONError(w, http.StatusBadRequest, "password must be at least 6 characters")
		return
	}
	if err := s.updateCustomerPassword(email, hashPassword(newPassword)); err != nil {
		log.Printf("update password: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "failed to update password")
		return
	}
	s.clearPasswordResetRequired(email)
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"message": "password updated",
	})
}

func (s *Server) handleCustomerLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
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

	var account CustomerAccount
	var err error
	if s.sqlStore != nil {
		account, err = s.sqlStore.GetCustomerByEmail(email)
		if err != nil {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	} else {
		s.customerMu.RLock()
		var exists bool
		account, exists = s.customers[email]
		s.customerMu.RUnlock()
		if !exists {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	}
	shippingMobile, shippingAddress := s.latestShippingForCustomer(email)
	writeJSON(w, http.StatusOK, map[string]any{
		"customer": CustomerProfile{
			Name:      account.Name,
			Email:     account.Email,
			CreatedAt: account.CreatedAt.Format(time.RFC3339),
			Mobile:    firstNonEmpty(account.Mobile, shippingMobile),
			Address:   firstNonEmpty(account.Address, shippingAddress),
		},
	})
}

func (s *Server) handleCustomerProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var payload CustomerProfileUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	updatedEmail := normalizeCustomerEmail(payload.Email)
	if updatedEmail == "" || !s.emailRegex.MatchString(updatedEmail) {
		writeJSONError(w, http.StatusBadRequest, "valid email is required")
		return
	}

	account, exists := s.customerAccountByEmail(email)
	if !exists {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if updatedEmail != email {
		if _, already := s.customerAccountByEmail(updatedEmail); already {
			writeJSONError(w, http.StatusBadRequest, "email already in use")
			return
		}
	}

	account.Email = updatedEmail
	account.Mobile = strings.TrimSpace(payload.Mobile)
	account.Address = strings.TrimSpace(payload.Address)

	if err := s.updateCustomerProfile(email, account); err != nil {
		log.Printf("update profile: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	if updatedEmail != email {
		token, err := s.issueCustomerToken(updatedEmail)
		if err != nil {
			log.Printf("token refresh: %v", err)
			writeJSONError(w, http.StatusInternalServerError, "failed to refresh session")
			return
		}
		setCustomerSessionCookie(w, token)
		s.movePasswordResetRequirement(email, updatedEmail)
	}

	shippingMobile, shippingAddress := s.latestShippingForCustomer(updatedEmail)
	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"customer": CustomerProfile{
			Name:      account.Name,
			Email:     account.Email,
			CreatedAt: account.CreatedAt.Format(time.RFC3339),
			Mobile:    firstNonEmpty(account.Mobile, shippingMobile),
			Address:   firstNonEmpty(account.Address, shippingAddress),
		},
	})
}

func (s *Server) handleCustomerOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	email, ok := s.customerEmailFromRequest(r)
	if !ok {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var list []orders.Order
	var err error
	if s.sqlStore != nil {
		list, err = s.sqlStore.ListOrdersByEmail(email)
	} else {
		list = s.ordersStore.ListForEmail(email)
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load orders")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"orders": list})
}

func (s *Server) customerAccountByEmail(email string) (CustomerAccount, bool) {
	if s.sqlStore != nil {
		acc, err := s.sqlStore.GetCustomerByEmail(email)
		if err == nil {
			return acc, true
		}
		return CustomerAccount{}, false
	}
	s.customerMu.RLock()
	acc, ok := s.customers[email]
	s.customerMu.RUnlock()
	return acc, ok
}

func (s *Server) markPasswordResetRequired(email string) {
	s.passwordResetMu.Lock()
	s.pendingPasswordReset[email] = true
	s.passwordResetMu.Unlock()
}

func (s *Server) clearPasswordResetRequired(email string) {
	s.passwordResetMu.Lock()
	delete(s.pendingPasswordReset, email)
	s.passwordResetMu.Unlock()
}

func (s *Server) movePasswordResetRequirement(oldEmail, newEmail string) {
	if oldEmail == newEmail {
		return
	}
	s.passwordResetMu.Lock()
	if _, ok := s.pendingPasswordReset[oldEmail]; ok {
		delete(s.pendingPasswordReset, oldEmail)
		s.pendingPasswordReset[newEmail] = true
	}
	s.passwordResetMu.Unlock()
}

func (s *Server) isPasswordResetRequired(email string) bool {
	s.passwordResetMu.RLock()
	_, ok := s.pendingPasswordReset[email]
	s.passwordResetMu.RUnlock()
	return ok
}

func (s *Server) updateCustomerPassword(email, hash string) error {
	if s.sqlStore != nil {
		return s.sqlStore.UpdateCustomerPassword(email, hash)
	}
	s.customerMu.Lock()
	account, ok := s.customers[email]
	if !ok {
		s.customerMu.Unlock()
		return sql.ErrNoRows
	}
	account.PasswordHash = hash
	s.customers[email] = account
	snapshot := s.customerSnapshotLocked()
	s.customerMu.Unlock()
	return saveCustomerSnapshot(s.customerDataPath, snapshot)
}

func (s *Server) updateCustomerProfile(oldEmail string, updated CustomerAccount) error {
	trueEmail := normalizeCustomerEmail(updated.Email)
	updated.Email = trueEmail
	if s.sqlStore != nil {
		return s.sqlStore.UpdateCustomerProfile(oldEmail, updated)
	}
	s.customerMu.Lock()
	if oldEmail != trueEmail {
		delete(s.customers, oldEmail)
	}
	s.customers[trueEmail] = updated
	snapshot := s.customerSnapshotLocked()
	s.customerMu.Unlock()
	return saveCustomerSnapshot(s.customerDataPath, snapshot)
}

func (s *Server) sendPasswordResetEmail(account CustomerAccount, password string) error {
	swayamVaniLogo := "/logo.jpeg"
	subject := "Swayamvani password reset"
	body := mailer.CreatePasswordResetBody(swayamVaniLogo, account.Name, account.Email, password)
	_, err := mailer.SendMail(account.Name, account.Email, subject, body)
	return err
}

func (s *Server) latestShippingForCustomer(email string) (string, string) {
	if s.sqlStore != nil {
		if last, ok, err := s.sqlStore.LastOrderByEmail(email); err == nil && ok {
			return last.Mobile, last.Address
		}
		return "", ""
	}
	orders := s.ordersStore.ListForEmail(email)
	if len(orders) == 0 {
		return "", ""
	}
	return orders[0].Mobile, orders[0].Address
}

func (s *Server) handleAdminOrders(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	statuses := []string{}
	if statusFilter != "" {
		if strings.EqualFold(statusFilter, "pending") {
			statuses = []string{"pending", "pending_payment"}
		} else {
			statuses = []string{statusFilter}
		}
	}

	var list []orders.Order
	var err error
	if s.sqlStore != nil {
		list, err = s.sqlStore.ListOrders(statuses)
	} else {
		list = s.ordersStore.ListAll()
		if len(statuses) > 0 {
			filtered := make([]orders.Order, 0, len(list))
			for _, o := range list {
				for _, st := range statuses {
					if strings.EqualFold(o.Status, st) {
						filtered = append(filtered, o)
						break
					}
				}
			}
			list = filtered
		}
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to load orders")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"orders": list})
}

func (s *Server) handleAdminOrderStatus(w http.ResponseWriter, r *http.Request) {
	if !s.isAdmin(r) {
		writeJSONError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if r.Method != http.MethodPatch && r.Method != http.MethodPut {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id, err := parseIDFromPath(r.URL.Path, "/api/admin/orders/")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid order id")
		return
	}
	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}
	payload.Status = strings.TrimSpace(payload.Status)
	if payload.Status == "" {
		writeJSONError(w, http.StatusBadRequest, "status is required")
		return
	}

	if s.sqlStore != nil {
		if err := s.sqlStore.UpdateOrderStatus(id, payload.Status); err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to update order")
			return
		}
	} else {
		if err := s.ordersStore.UpdateStatus(id, payload.Status); err != nil {
			if errors.Is(err, os.ErrNotExist) {
				writeJSONError(w, http.StatusNotFound, "order not found")
				return
			}
			writeJSONError(w, http.StatusInternalServerError, "failed to update order")
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
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
	var accounts []CustomerAccount
	var err error
	if s.sqlStore != nil {
		accounts, err = s.sqlStore.ListCustomers()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "failed to load customers")
			return
		}
	} else {
		s.customerMu.RLock()
		for _, acc := range s.customers {
			accounts = append(accounts, acc)
		}
		s.customerMu.RUnlock()
	}
	customers := make([]map[string]string, 0, len(accounts))
	for _, account := range accounts {
		customers = append(customers, map[string]string{
			"name":       account.Name,
			"email":      account.Email,
			"created_at": account.CreatedAt.Format(time.RFC3339),
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"customers": customers})
}

func (s *Server) handleGetOffers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	active, list, err := s.currentOffers()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"offers": active, "list": list.Offers})
}

func (s *Server) handleAdminOffers(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		active, list, err := s.currentOffers()
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"offers": active, "list": list.Offers})
	case http.MethodPost:
		if !s.isAdmin(r) {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		var payload struct {
			ID     int         `json:"id"`
			Config OfferConfig `json:"config"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
			return
		}
		if s.sqlStore != nil {
			id, err := s.sqlStore.UpsertOffer(payload.ID, payload.Config)
			if err != nil {
				writeJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			active, list, err := s.sqlStore.ActiveOffer()
			if err != nil {
				writeJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			s.cacheOffers(active, OffersFile{Offers: list})
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "id": id, "offers": active, "list": list})
		} else {
			s.offerMu.Lock()
			id := s.upsertOfferLocked(payload.ID, payload.Config, false)
			active := s.offerConfig
			list := s.offerList
			s.offerMu.Unlock()
			if err := saveOffersFile(s.offerConfigPath, list); err != nil {
				writeJSONError(w, http.StatusInternalServerError, "failed to save offers")
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "id": id, "offers": active, "list": list.Offers})
		}
	case http.MethodPatch:
		if !s.isAdmin(r) {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		var payload struct {
			ID int `json:"id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeJSONError(w, http.StatusBadRequest, "invalid JSON payload")
			return
		}
		if s.sqlStore != nil {
			if err := s.sqlStore.ActivateOffer(payload.ID); err != nil {
				writeJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			active, list, err := s.sqlStore.ActiveOffer()
			if err != nil {
				writeJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			s.cacheOffers(active, OffersFile{Offers: list})
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "offers": active, "list": list})
		} else {
			s.offerMu.Lock()
			if err := s.activateOfferLocked(payload.ID); err != nil {
				s.offerMu.Unlock()
				writeJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			active := s.offerConfig
			list := s.offerList
			s.offerMu.Unlock()
			if err := saveOffersFile(s.offerConfigPath, list); err != nil {
				writeJSONError(w, http.StatusInternalServerError, "failed to save offers")
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "offers": active, "list": list.Offers})
		}
	case http.MethodDelete:
		if !s.isAdmin(r) {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		idStr := r.URL.Query().Get("id")
		id, err := strconv.Atoi(idStr)
		if err != nil || id <= 0 {
			writeJSONError(w, http.StatusBadRequest, "invalid id")
			return
		}
		if s.sqlStore != nil {
			if err := s.sqlStore.DeleteOffer(id); err != nil {
				writeJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			active, list, err := s.sqlStore.ActiveOffer()
			if err != nil {
				writeJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			// ensure an active offer
			if (active == OfferConfig{}) && len(list) > 0 {
				_ = s.sqlStore.ActivateOffer(list[0].ID)
				active = list[0].Config
				active, list, _ = s.sqlStore.ActiveOffer()
			}
			s.cacheOffers(active, OffersFile{Offers: list})
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "offers": active, "list": list})
		} else {
			s.offerMu.Lock()
			if err := s.deleteOfferLocked(id); err != nil {
				s.offerMu.Unlock()
				writeJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			active := s.offerConfig
			list := s.offerList
			s.offerMu.Unlock()
			if err := saveOffersFile(s.offerConfigPath, list); err != nil {
				writeJSONError(w, http.StatusInternalServerError, "failed to save offers")
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "offers": active, "list": list.Offers})
		}
	default:
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
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
	// DB-backed customers
	if s.sqlStore != nil {
		accounts, err := s.sqlStore.ListCustomers()
		if err != nil {
			return err
		}
		// If DB empty, migrate from file snapshot once.
		if len(accounts) == 0 {
			fileAccounts, err := loadCustomerAccounts(s.customerDataPath)
			if err == nil && len(fileAccounts) > 0 {
				for _, acc := range fileAccounts {
					_ = s.sqlStore.CreateCustomer(acc)
				}
				accounts, _ = s.sqlStore.ListCustomers()
			}
		}
		s.customerMu.Lock()
		for _, account := range accounts {
			s.customers[strings.ToLower(strings.TrimSpace(account.Email))] = account
		}
		s.customerMu.Unlock()
		return nil
	}

	// File-backed customers (legacy)
	accounts, err := loadCustomerAccounts(s.customerDataPath)
	if err != nil {
		return err
	}
	s.customerMu.Lock()
	for _, account := range accounts {
		s.customers[strings.ToLower(strings.TrimSpace(account.Email))] = account
	}
	s.customerMu.Unlock()
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
	if s.sqlStore != nil {
		active, list, err := s.sqlStore.ActiveOffer()
		if err != nil {
			return err
		}
		s.cacheOffers(active, OffersFile{Offers: list})
		return nil
	}
	file, err := loadOffersFile(s.offerConfigPath)
	if err != nil {
		legacy, legacyErr := loadOfferConfig(s.offerConfigPath)
		if legacyErr != nil {
			return legacyErr
		}
		if (legacy != OfferConfig{}) {
			file = OffersFile{Offers: []OfferEntry{{ID: 1, Active: true, Config: legacy}}}
		} else {
			return err
		}
	}
	activeCfg := OfferConfig{}
	activeSet := false
	for i, entry := range file.Offers {
		if entry.Active {
			activeCfg = entry.Config
			activeSet = true
			file.Offers[i].Active = true
			break
		}
	}
	if !activeSet && len(file.Offers) > 0 {
		file.Offers[0].Active = true
		activeCfg = file.Offers[0].Config
	}
	s.cacheOffers(activeCfg, file)
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

func saveOffersFile(path string, file OffersFile) error {
	if len(file.Offers) == 0 {
		file.Offers = []OfferEntry{}
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	body, err := json.MarshalIndent(file, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, body, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func loadOffersFile(path string) (OffersFile, error) {
	var file OffersFile
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return file, nil
	}
	if err != nil {
		return file, err
	}
	if err := json.Unmarshal(data, &file); err != nil {
		return file, err
	}
	return file, nil
}

func (s *Server) nextOfferIDLocked() int {
	maxID := 0
	for _, entry := range s.offerList.Offers {
		if entry.ID > maxID {
			maxID = entry.ID
		}
	}
	return maxID + 1
}

func (s *Server) setActiveOfferLocked(cfg OfferConfig, id int) {
	s.offerConfig = cfg
	updated := make([]OfferEntry, 0, len(s.offerList.Offers))
	for _, entry := range s.offerList.Offers {
		entry.Active = entry.ID == id
		updated = append(updated, entry)
		if entry.Active {
			entry.Config = cfg
		}
	}
	s.offerList.Offers = updated
	if id == 0 {
		newID := s.nextOfferIDLocked()
		s.offerList.Offers = append([]OfferEntry{{ID: newID, Active: true, Config: cfg}}, updated...)
	}
}

func (s *Server) upsertOfferLocked(id int, cfg OfferConfig, makeActive bool) int {
	if id == 0 {
		id = s.nextOfferIDLocked()
		s.offerList.Offers = append(s.offerList.Offers, OfferEntry{ID: id, Active: false, Config: cfg})
	} else {
		found := false
		for i, entry := range s.offerList.Offers {
			if entry.ID == id {
				entry.Config = cfg
				s.offerList.Offers[i] = entry
				found = true
				break
			}
		}
		if !found {
			s.offerList.Offers = append(s.offerList.Offers, OfferEntry{ID: id, Active: false, Config: cfg})
		}
	}
	if makeActive || len(s.offerList.Offers) == 1 {
		_ = s.activateOfferLocked(id)
	}
	return id
}

func (s *Server) activateOfferLocked(id int) error {
	found := false
	for i := range s.offerList.Offers {
		entry := s.offerList.Offers[i]
		entry.Active = entry.ID == id
		s.offerList.Offers[i] = entry
		if entry.Active {
			s.offerConfig = entry.Config
			found = true
		}
	}
	if !found {
		return errors.New("offer not found")
	}
	return nil
}

func (s *Server) deleteOfferLocked(id int) error {
	newList := make([]OfferEntry, 0, len(s.offerList.Offers))
	activeRemoved := false
	for _, entry := range s.offerList.Offers {
		if entry.ID == id {
			if entry.Active {
				activeRemoved = true
			}
			continue
		}
		newList = append(newList, entry)
	}
	if len(newList) == len(s.offerList.Offers) {
		return errors.New("offer not found")
	}
	s.offerList.Offers = newList
	if activeRemoved {
		if len(newList) > 0 {
			s.offerConfig = newList[0].Config
			newList[0].Active = true
			s.offerList.Offers[0] = newList[0]
		} else {
			s.offerConfig = OfferConfig{}
		}
	}
	return nil
}

func hashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

func generateTemporaryPassword() string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
	const length = 10
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return "Swayamvani123"
	}
	for i := range buf {
		buf[i] = charset[int(buf[i])%len(charset)]
	}
	return string(buf)
}

func (s *Server) customerEmailFromRequest(r *http.Request) (string, bool) {
	cookie, err := r.Cookie("customer_session")
	if err != nil {
		return "", false
	}
	if email, ok := s.parseCustomerToken(cookie.Value); ok {
		return email, true
	}
	return "", false
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

func normalizeCustomerEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
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
