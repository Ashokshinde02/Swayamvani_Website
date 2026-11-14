package orders

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"math/big"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Item mirrors a checkout line item.
type Item struct {
	ProductID int    `json:"product_id,omitempty"`
	Name      string `json:"name"`
	Price     int    `json:"price"`
	Image     string `json:"image,omitempty"`
	Quantity  int    `json:"quantity,omitempty"`
}

// Order represents a placed order that can be shown in "My Orders".
type Order struct {
	ID            int            `json:"id"`
	OrderNumber   int            `json:"order_number"`
	CustomerEmail string         `json:"customer_email"`
	CustomerName  string         `json:"customer_name,omitempty"`
	Items         []Item         `json:"items"`
	Total         int            `json:"total"`
	Status        string         `json:"status"`
	PaymentRef    string         `json:"payment_ref,omitempty"`
	Mobile        string         `json:"mobile,omitempty"`
	Address       string         `json:"address,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	Metadata      map[string]any `json:"metadata,omitempty"`
}

// GenerateOrderNumber returns a cryptographically random six-digit order number.
func GenerateOrderNumber() (int, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return 0, err
	}
	return int(n.Int64()) + 100000, nil
}

// Store keeps orders in-memory with a file snapshot for persistence when SQL is absent.
type Store struct {
	mu       sync.RWMutex
	orders   []Order
	nextID   int
	dataPath string
}

func NewStore(basePath string) *Store {
	return &Store{
		dataPath: filepath.Join(basePath, "orders.json"),
	}
}

func (o *Store) Load() error {
	o.mu.Lock()
	defer o.mu.Unlock()

	f, err := os.Open(o.dataPath)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	defer f.Close()

	var orders []Order
	if err := json.NewDecoder(f).Decode(&orders); err != nil {
		return err
	}
	o.orders = orders
	numbers := make(map[int]struct{}, len(o.orders))
	needsSave := false
	for _, ord := range orders {
		if ord.ID > o.nextID {
			o.nextID = ord.ID
		}
	}
	for i := range o.orders {
		if o.orders[i].OrderNumber > 0 {
			numbers[o.orders[i].OrderNumber] = struct{}{}
			continue
		}
		orderNumber, err := uniqueOrderNumber(numbers)
		if err != nil {
			return err
		}
		o.orders[i].OrderNumber = orderNumber
		numbers[orderNumber] = struct{}{}
		needsSave = true
	}
	if needsSave {
		return o.saveLocked()
	}
	return nil
}

func uniqueOrderNumber(used map[int]struct{}) (int, error) {
	for range 100 {
		number, err := GenerateOrderNumber()
		if err != nil {
			return 0, err
		}
		if _, exists := used[number]; !exists {
			return number, nil
		}
	}
	return 0, errors.New("could not generate a unique order number")
}

func (o *Store) saveLocked() error {
	if err := os.MkdirAll(filepath.Dir(o.dataPath), 0o755); err != nil {
		return err
	}
	f, err := os.Create(o.dataPath)
	if err != nil {
		return err
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	return enc.Encode(o.orders)
}

func (o *Store) Add(email, name string, items []Item, total int, status, paymentRef, mobile, address string, metadata map[string]any) (Order, error) {
	o.mu.Lock()
	defer o.mu.Unlock()
	used := make(map[int]struct{}, len(o.orders))
	for _, existing := range o.orders {
		if existing.OrderNumber > 0 {
			used[existing.OrderNumber] = struct{}{}
		}
	}
	orderNumber, err := uniqueOrderNumber(used)
	if err != nil {
		return Order{}, err
	}
	o.nextID++
	order := Order{
		ID:            o.nextID,
		OrderNumber:   orderNumber,
		CustomerEmail: email,
		CustomerName:  name,
		Items:         items,
		Total:         total,
		Status:        status,
		PaymentRef:    paymentRef,
		Mobile:        mobile,
		Address:       address,
		CreatedAt:     time.Now(),
		Metadata:      metadata,
	}
	o.orders = append(o.orders, order)
	if err := o.saveLocked(); err != nil {
		return Order{}, err
	}
	return order, nil
}

func (o *Store) ListForEmail(email string) []Order {
	o.mu.RLock()
	defer o.mu.RUnlock()
	out := make([]Order, 0)
	for i := len(o.orders) - 1; i >= 0; i-- {
		ord := o.orders[i]
		if ord.CustomerEmail == email {
			out = append(out, ord)
		}
	}
	return out
}

func (o *Store) UpdateStatus(id int, status string) error {
	o.mu.Lock()
	defer o.mu.Unlock()
	for idx := range o.orders {
		if o.orders[idx].ID == id {
			o.orders[idx].Status = status
			return o.saveLocked()
		}
	}
	return os.ErrNotExist
}

func (o *Store) ListAll() []Order {
	o.mu.RLock()
	defer o.mu.RUnlock()
	out := make([]Order, len(o.orders))
	copy(out, o.orders)
	// reverse to show newest first
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return out
}
