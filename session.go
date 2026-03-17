package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

// SessionManager manages expiring tokens for admin and legacy customer flows.
type SessionManager struct {
	mu       sync.Mutex
	sessions map[string]time.Time
	ttl      time.Duration
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

// Customer session helpers (stateless, signed token)

func loadSessionSecret() []byte {
	secret := strings.TrimSpace(os.Getenv("CUSTOMER_SESSION_SECRET"))
	if secret != "" {
		return []byte(secret)
	}
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err == nil {
		log.Println("warning: CUSTOMER_SESSION_SECRET not set; using ephemeral secret (sessions reset on restart)")
		return buf
	}
	log.Println("warning: CUSTOMER_SESSION_SECRET not set and random failed; falling back to default secret")
	return []byte("fallback-customer-session-secret")
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
		Expires:  time.Now().Add(12 * time.Hour),
	})
}

func (s *Server) issueCustomerToken(email string) (string, error) {
	exp := time.Now().Add(12 * time.Hour).Unix()
	payload := fmt.Sprintf("%s|%d", email, exp)
	mac := hmac.New(sha256.New, s.sessionSecret)
	mac.Write([]byte(payload))
	sig := mac.Sum(nil)
	token := fmt.Sprintf("%s|%s", payload, base64.RawURLEncoding.EncodeToString(sig))
	return base64.RawURLEncoding.EncodeToString([]byte(token)), nil
}

func (s *Server) parseCustomerToken(token string) (string, bool) {
	if token == "" {
		return "", false
	}
	raw, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return "", false
	}
	parts := strings.Split(string(raw), "|")
	if len(parts) != 3 {
		return "", false
	}
	email := parts[0]
	expStr := parts[1]
	sigProvided, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return "", false
	}
	payload := fmt.Sprintf("%s|%s", email, expStr)
	mac := hmac.New(sha256.New, s.sessionSecret)
	mac.Write([]byte(payload))
	expected := mac.Sum(nil)
	if !hmac.Equal(sigProvided, expected) {
		return "", false
	}
	exp, err := strconv.ParseInt(expStr, 10, 64)
	if err != nil {
		return "", false
	}
	if time.Now().Unix() > exp {
		return "", false
	}
	return email, true
}

func (s *Server) cacheOffers(active OfferConfig, file OffersFile) {
	s.offerMu.Lock()
	s.offerConfig = active
	s.offerList = file
	s.offerMu.Unlock()
}

func (s *Server) currentOffers() (OfferConfig, OffersFile, error) {
	if s.sqlStore != nil {
		active, list, err := s.sqlStore.ActiveOffer()
		if err == nil && len(list) == 0 {
			_ = s.sqlStore.seedOffers()
			active, list, err = s.sqlStore.ActiveOffer()
		}
		if err != nil {
			return OfferConfig{}, OffersFile{}, err
		}
		s.cacheOffers(active, OffersFile{Offers: list})
		return active, OffersFile{Offers: list}, nil
	}
	s.offerMu.RLock()
	active := s.offerConfig
	list := s.offerList
	s.offerMu.RUnlock()
	return active, list, nil
}
