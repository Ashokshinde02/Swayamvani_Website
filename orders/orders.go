package orders

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Item mirrors a checkout line item.
type Item struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
	Image string `json:"image,omitempty"`
}

// Order represents a placed order that can be shown in "My Orders".
type Order struct {
	ID            int            `json:"id"`
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
	for _, ord := range orders {
		if ord.ID > o.nextID {
			o.nextID = ord.ID
		}
	}
	return nil
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
	o.nextID++
	order := Order{
		ID:            o.nextID,
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
