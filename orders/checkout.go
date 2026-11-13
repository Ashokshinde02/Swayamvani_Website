package orders

import (
	"errors"
	"fmt"
	"strings"
)

// CheckoutLineItem is the untrusted product and quantity pair submitted by a shopper.
type CheckoutLineItem struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

// CheckoutProduct contains catalog data required to price a checkout line.
type CheckoutProduct struct {
	ID           int
	Name         string
	Price        int
	Image        string
	Availability string
}

// CheckoutOffer contains active pricing rules loaded by the server.
type CheckoutOffer struct {
	OfferType     string
	Discount      int
	CouponCode    string
	CouponPercent int
	CouponEnabled bool
}

var ErrInvalidCheckout = errors.New("invalid checkout")

// CalculateCheckoutItems validates shopper selections and calculates all prices
// from trusted catalog and offer data supplied by the server.
func CalculateCheckoutItems(lines []CheckoutLineItem, products []CheckoutProduct, offer CheckoutOffer, couponCode string) ([]Item, int, error) {
	if len(lines) == 0 || len(lines) > 50 {
		return nil, 0, fmt.Errorf("%w: cart must contain between 1 and 50 items", ErrInvalidCheckout)
	}
	byID := make(map[int]CheckoutProduct, len(products))
	for _, product := range products {
		byID[product.ID] = product
	}
	pct := 0
	if code := strings.TrimSpace(couponCode); code != "" {
		if !offer.CouponEnabled || offer.CouponCode == "" || offer.CouponPercent <= 0 || !strings.EqualFold(code, offer.CouponCode) {
			return nil, 0, fmt.Errorf("%w: invalid or unavailable coupon", ErrInvalidCheckout)
		}
		pct = offer.CouponPercent
	} else if offer.OfferType == "discount" {
		pct = offer.Discount
	}
	if pct < 0 {
		pct = 0
	}
	if pct > 90 {
		pct = 90
	}

	type pricedLine struct {
		item     Item
		subtotal int64
	}
	priced := make([]pricedLine, 0, len(lines))
	var subtotal int64
	for _, line := range lines {
		product, exists := byID[line.ProductID]
		if !exists || line.ProductID <= 0 || line.Quantity < 1 || line.Quantity > 99 || product.Price <= 0 || product.Price > 1_000_000_000 {
			return nil, 0, fmt.Errorf("%w: invalid product or quantity", ErrInvalidCheckout)
		}
		if strings.EqualFold(strings.TrimSpace(product.Availability), "out_of_stock") {
			return nil, 0, fmt.Errorf("%w: %s is out of stock", ErrInvalidCheckout, product.Name)
		}
		unit := product.Price
		// Coupon-only campaigns apply their percentage once to the cart total.
		if pct > 0 && !(offer.OfferType == "coupon" && strings.TrimSpace(couponCode) != "") {
			unit = (product.Price*(100-pct) + 50) / 100
		}
		lineTotal := int64(unit) * int64(line.Quantity)
		subtotal += lineTotal
		if subtotal > 1_000_000_000_000 {
			return nil, 0, fmt.Errorf("%w: order total is too large", ErrInvalidCheckout)
		}
		priced = append(priced, pricedLine{
			item:     Item{Name: product.Name, Image: product.Image, Quantity: line.Quantity},
			subtotal: lineTotal,
		})
	}

	total := int(subtotal)
	if pct > 0 && offer.OfferType == "coupon" && strings.TrimSpace(couponCode) != "" {
		total = int((subtotal*int64(100-pct) + 50) / 100)
		allocated := 0
		for i := range priced {
			lineAmount := total - allocated
			if i < len(priced)-1 {
				lineAmount = int((int64(total)*priced[i].subtotal + subtotal/2) / subtotal)
				allocated += lineAmount
			}
			priced[i].item.Price = lineAmount
		}
	} else {
		for i := range priced {
			priced[i].item.Price = int(priced[i].subtotal)
		}
	}

	items := make([]Item, len(priced))
	for i := range priced {
		items[i] = priced[i].item
	}
	return items, total, nil
}
