package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"swayamvani/orders"
)

type CheckoutRequest struct {
	Items      []orders.CheckoutLineItem `json:"items"`
	CouponCode string                    `json:"coupon_code"`
	Mobile     string                    `json:"mobile"`
	Address    string                    `json:"address"`
}

type RazorpayOrderRequest struct {
	Items      []orders.CheckoutLineItem `json:"items"`
	CouponCode string                    `json:"coupon_code"`
}

type RazorpayOrderResponse struct {
	ID       string `json:"id"`
	Amount   int    `json:"amount"`
	Currency string `json:"currency"`
}

// resolveCheckoutItems adapts the catalog and active campaign to the orders module.
func (s *Server) resolveCheckoutItems(lines []orders.CheckoutLineItem, couponCode string) ([]orders.Item, int, error) {
	products, err := s.store.ListProducts()
	if err != nil {
		return nil, 0, err
	}
	trustedProducts := make([]orders.CheckoutProduct, 0, len(products))
	for _, product := range products {
		image := ""
		if len(product.Images) > 0 {
			image = product.Images[0]
		}
		trustedProducts = append(trustedProducts, orders.CheckoutProduct{
			ID: product.ID, Name: product.Name, Price: product.Price,
			Image: image, Availability: product.Availability,
		})
	}
	active, _, err := s.currentOffers()
	if err != nil {
		return nil, 0, err
	}
	return orders.CalculateCheckoutItems(lines, trustedProducts, orders.CheckoutOffer{
		OfferType: active.OfferType, Discount: active.DiscountPercent,
		CouponCode: active.CouponCode, CouponPercent: active.CouponPercent,
		CouponEnabled: active.CouponEnabled,
	}, couponCode)
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
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64*1024)).Decode(&payload); err != nil {
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

	orderItems, total, err := s.resolveCheckoutItems(payload.Items, payload.CouponCode)
	if err != nil {
		if errors.Is(err, orders.ErrInvalidCheckout) {
			writeJSONError(w, http.StatusBadRequest, err.Error())
		} else {
			writeJSONError(w, http.StatusInternalServerError, "failed to verify product prices")
		}
		return
	}
	order, err := s.createOrder(email, accountName, orderItems, total, "pending", "", payload.Mobile, payload.Address, map[string]any{"channel": "whatsapp"})
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to save order")
		return
	}
	message := fmt.Sprintf(
		"Swayamvani Harmoniums\nhttps://www.swayamvani.com\nLogo: https://www.swayamvani.com/logo.jpeg\n\nNew order\nOrder reference: #%d\nName: %s\nEmail: %s\nMobile: %s\nAddress: %s\n\nItems:",
		order.OrderNumber,
		order.CustomerName,
		order.CustomerEmail,
		order.Mobile,
		order.Address,
	)
	for _, item := range order.Items {
		message += fmt.Sprintf("\n%s x %d (Rs %d)", item.Name, item.Quantity, item.Price)
		if item.Image != "" {
			imageURL := item.Image
			if strings.HasPrefix(imageURL, "/") {
				imageURL = "https://www.swayamvani.com" + imageURL
			}
			message += "\nImage: " + imageURL
		}
	}
	message += fmt.Sprintf("\n\nTotal: Rs %d", order.Total)
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
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64*1024)).Decode(&payload); err != nil {
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

	orderItems, totalINR, err := s.resolveCheckoutItems(payload.Items, payload.CouponCode)
	if err != nil {
		if errors.Is(err, orders.ErrInvalidCheckout) {
			writeJSONError(w, http.StatusBadRequest, err.Error())
		} else {
			writeJSONError(w, http.StatusInternalServerError, "failed to verify product prices")
		}
		return
	}
	names := make([]string, 0, len(payload.Items))
	for _, item := range orderItems {
		names = append(names, fmt.Sprintf("%s x %d", item.Name, item.Quantity))
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
