// Package ratelimit provides configurable, per-client HTTP request limits.
package ratelimit

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Rule limits one client to Limit requests during Window for a named route.
type Rule struct {
	Limit  int
	Window time.Duration
}

// Config defines route limits and an optional trusted single-IP header.
type Config struct {
	Enabled        bool
	ClientIPHeader string
	RouteLimits    map[string]Rule
}

// DefaultConfig provides conservative defaults for public and account endpoints.
func DefaultConfig() Config {
	return Config{
		Enabled: true,
		RouteLimits: map[string]Rule{
			"admin_login":       {Limit: 5, Window: 15 * time.Minute},
			"customer_login":    {Limit: 10, Window: 15 * time.Minute},
			"customer_register": {Limit: 5, Window: time.Hour},
			"password_reset":    {Limit: 3, Window: time.Hour},
			"password_update":   {Limit: 5, Window: 15 * time.Minute},
			"checkout":          {Limit: 20, Window: time.Minute},
			"razorpay_order":    {Limit: 10, Window: time.Minute},
			"coupon_use":        {Limit: 10, Window: time.Minute},
			"inquiry":           {Limit: 5, Window: time.Hour},
		},
	}
}

// ConfigFromEnv reads RATE_LIMIT_ENABLED, RATE_LIMIT_CLIENT_IP_HEADER, and per-route
// values such as RATE_LIMIT_ADMIN_LOGIN=5/15m. Invalid values keep safe defaults.
func ConfigFromEnv() Config {
	cfg := DefaultConfig()
	if value, ok := os.LookupEnv("RATE_LIMIT_ENABLED"); ok {
		cfg.Enabled = parseBool(value, cfg.Enabled)
	}
	if value, ok := os.LookupEnv("RATE_LIMIT_CLIENT_IP_HEADER"); ok {
		cfg.ClientIPHeader = http.CanonicalHeaderKey(strings.TrimSpace(value))
	}
	for route, rule := range cfg.RouteLimits {
		key := "RATE_LIMIT_" + strings.ToUpper(strings.ReplaceAll(route, "-", "_"))
		value, ok := os.LookupEnv(key)
		if !ok {
			continue
		}
		parsed, err := parseRule(value, rule.Window)
		if err != nil {
			log.Printf("warning: ignoring invalid %s value", key)
			continue
		}
		cfg.RouteLimits[route] = parsed
	}
	return cfg
}

type bucket struct {
	expires time.Time
	count   int
}

// Limiter maintains process-local request counters.
type Limiter struct {
	config  Config
	mu      sync.Mutex
	buckets map[string]bucket
	checks  uint64
}

// New creates a limiter from the supplied configuration.
func New(config Config) *Limiter {
	return &Limiter{config: config, buckets: make(map[string]bucket)}
}

// Wrap applies the named route's configured limit to an HTTP handler.
func (l *Limiter) Wrap(route string, next http.Handler) http.Handler {
	rule, configured := l.config.RouteLimits[route]
	if !l.config.Enabled || !configured || rule.Limit <= 0 || rule.Window <= 0 {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowed, retryAfter := l.allow(route, clientIP(r, l.config.ClientIPHeader), rule)
		if !allowed {
			seconds := int((retryAfter + time.Second - 1) / time.Second)
			if seconds < 1 {
				seconds = 1
			}
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("Cache-Control", "no-store")
			w.Header().Set("Retry-After", strconv.Itoa(seconds))
			w.WriteHeader(http.StatusTooManyRequests)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "too many requests; try again later"})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *Limiter) allow(route, ip string, rule Rule) (bool, time.Duration) {
	now := time.Now()
	key := route + "|" + ip
	l.mu.Lock()
	defer l.mu.Unlock()

	entry, exists := l.buckets[key]
	if !exists || !now.Before(entry.expires) {
		l.buckets[key] = bucket{expires: now.Add(rule.Window), count: 1}
	} else if entry.count >= rule.Limit {
		return false, entry.expires.Sub(now)
	} else {
		entry.count++
		l.buckets[key] = entry
	}

	l.checks++
	if l.checks%256 == 0 {
		for bucketKey, current := range l.buckets {
			if !now.Before(current.expires) {
				delete(l.buckets, bucketKey)
			}
		}
	}
	return true, 0
}

func clientIP(r *http.Request, trustedHeader string) string {
	if trustedHeader != "" {
		// Accept only a single address. Chained headers such as X-Forwarded-For
		// are ambiguous and can contain values supplied by the client.
		if ip := net.ParseIP(strings.TrimSpace(r.Header.Get(trustedHeader))); ip != nil {
			return ip.String()
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = strings.Trim(r.RemoteAddr, "[]")
	}
	if ip := net.ParseIP(host); ip != nil {
		return ip.String()
	}
	if host == "" {
		return "unknown"
	}
	return host
}

func parseRule(value string, defaultWindow time.Duration) (Rule, error) {
	parts := strings.Split(strings.TrimSpace(value), "/")
	limit, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil || limit < 0 {
		return Rule{}, strconv.ErrSyntax
	}
	window := defaultWindow
	if len(parts) > 2 {
		return Rule{}, strconv.ErrSyntax
	}
	if len(parts) == 2 {
		window, err = time.ParseDuration(strings.TrimSpace(parts[1]))
		if err != nil || window <= 0 {
			return Rule{}, strconv.ErrSyntax
		}
	}
	return Rule{Limit: limit, Window: window}, nil
}

func parseBool(value string, fallback bool) bool {
	parsed, err := strconv.ParseBool(strings.TrimSpace(value))
	if err != nil {
		return fallback
	}
	return parsed
}
