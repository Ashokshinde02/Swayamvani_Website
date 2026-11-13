package mailer

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"html"
	"io"
	"net"
	"net/smtp"
	"strconv"
	"strings"

	localConfig "swayamvani/config"
	"swayamvani/orders"
)

func SendMail(customerName string, receiptantMailId string, subject string, body string) (bool, error) {

	fmt.Println("In Send Mail")
	decryptedPassword, err := Decrypt(localConfig.EncryptedPassword, localConfig.DecriptionKey)
	if err != nil {
		fmt.Println("Decrypt error:", err)
		return false, err
	}

	//to := "shindeashok944@gmail.com"
	//subject := "Test Email from Go"
	//body := "<h1>Hello 👋</h1><p>This is an HTML email.</p>"

	//smtpHost := "smtpout.secureserver.net"
	//smtpPort := "465"

	msg := "From: " + localConfig.From + "\r\n" +
		"To: " + receiptantMailId + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-version: 1.0;\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
		body
	//fmt.Println("message" + msg)
	// Set up TLS config
	/*tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         localConfig.TitanSMTPHost,
	}
	*/
	// Connect to the SMTP server
	/*conn, err := tls.Dial("tcp", localConfig.TitanSMTPHost+":"+localConfig.TitanSMTPPort, tlsconfig)
	if err != nil {
		fmt.Println("Dialing Error:", err)
		return false, err
	}*/

	conn, err := net.Dial("tcp", fmt.Sprintf("%s:%s", localConfig.TitanSMTPHost, localConfig.TitanSMTPPort))
	if err != nil {
		return false, err
	}
	fmt.Println("after net dial", err)
	/*conn, err := net.Dial("tcp", net.JoinHostPort(localConfig.TitanSMTPHost, localConfig.TitanSMTPPort))
	if err != nil {
		return false, err
	}*/

	c, err := smtp.NewClient(conn, localConfig.TitanSMTPHost)
	if err != nil {
		fmt.Println("Client Error:", err)
		return false, err
	}
	fmt.Println("after new client")
	if ok, _ := c.Extension("STARTTLS"); ok {
		if err := c.StartTLS(&tls.Config{ServerName: localConfig.TitanSMTPHost}); err != nil {
			return false, err
		}
	}
	fmt.Println("Starttls")
	// Auth
	auth := smtp.PlainAuth("", localConfig.From, decryptedPassword, localConfig.TitanSMTPHost)
	if err = c.Auth(auth); err != nil {
		fmt.Println("Auth Error:", err)
		return false, err
	}
	fmt.Println("after plain auth")
	// Set sender and recipient
	if err = c.Mail(localConfig.From); err != nil {
		fmt.Println("Mail Error:", err)
		return false, err
	}
	fmt.Println("set sender")
	if err = c.Rcpt(receiptantMailId); err != nil {
		fmt.Println("Rcpt Error:", err)
		return false, err
	}
	fmt.Println("recpt")
	// Send the email body
	w, err := c.Data()
	if err != nil {
		fmt.Println("Data Error:", err)
		return false, err
	}
	fmt.Println("send email body", w)
	_, err = w.Write([]byte(msg))
	if err != nil {
		fmt.Println("Write Error:", err)
		return false, err
	}
	err = w.Close()
	if err != nil {
		fmt.Println("Close Error:", err)
		return false, err
	}

	c.Quit()
	fmt.Println("Email sent successfully!")
	return true, nil
}

// Encrypt text with a key
func Encrypt(plainText, key string) (string, error) {
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	cipherText := aesGCM.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

func Decrypt(encryptedText, key string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := aesGCM.NonceSize()
	nonce, cipherText := data[:nonceSize], data[nonceSize:]
	plainText, err := aesGCM.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", err
	}
	return string(plainText), nil
}

func CreateEmailBody(swayamvaniLogo string, customerName string, customerEmail string) string {
	const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Swayamvani</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; }
    .logo { display: block; margin: 0 auto 16px auto; width: 120px; height: 120px; border: 3px solid #d9bd82; border-radius: 50%; object-fit: cover; background: #000; }
    .brand { color: #71351f; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 4px; }
    .brand-tagline { color: #705b4a; font-size: 13px; letter-spacing: 1px; text-align: center; margin: 0 0 22px; }
    .details { background: #f1f8e9; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .details strong { display: inline-block; width: 120px; }
    .footer { text-align: center; color: #888; font-size: 13px; margin-top: 32px; }
    .btn { display: inline-block; background: #2d7a2d; color: #fff; padding: 10px 24px; border-radius: 4px; text-decoration: none; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{LOGO}}" alt="Swayamvani Logo" class="logo">
    <div class="brand">Swayamvani</div>
    <div class="brand-tagline">Destination for every musical journey</div>
    <h2>Welcome, {{CUSTOMER_NAME}}!</h2>
    <p>Your account has been successfully created on <strong>Swayamvani</strong>.</p>
    <div class="details">
      <p><strong>Name:</strong> {{CUSTOMER_NAME}}</p>
      <p><strong>Email:</strong> {{CUSTOMER_EMAIL}}</p>
    </div>
    <a href="https://swayamvani.com/login" class="btn">Login to Your Account</a>
    <p>If you did not request this account, please contact our support team immediately.</p>
    <div class="footer">
      &copy; 2026 Swayamvani. All rights reserved.<br>
      <a href="https://swayamvani.com" style="color:#2d7a2d;text-decoration:none;">www.swayamvani.com</a>
    </div>
  </div>
</body>
</html>
`
	return strings.NewReplacer(
		"{{LOGO}}", html.EscapeString(swayamvaniLogo),
		"{{CUSTOMER_NAME}}", html.EscapeString(customerName),
		"{{CUSTOMER_EMAIL}}", html.EscapeString(customerEmail),
	).Replace(emailTemplate)
}

func CreatePasswordResetLinkBody(swayamvaniLogo string, customerName string, customerEmail string, resetURL string) string {
	const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset your Swayamvani password</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; }
    .logo { display: block; margin: 0 auto 16px auto; width: 120px; height: 120px; border: 3px solid #d9bd82; border-radius: 50%; object-fit: cover; background: #000; }
    .brand { color: #71351f; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 4px; }
    .brand-tagline { color: #705b4a; font-size: 13px; letter-spacing: 1px; text-align: center; margin: 0 0 22px; }
    .details { background: #f1f8e9; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .details strong { display: inline-block; width: 130px; }
    .footer { text-align: center; color: #888; font-size: 13px; margin-top: 32px; }
    .btn { display: inline-block; background: #2d7a2d; color: #fff; padding: 10px 24px; border-radius: 4px; text-decoration: none; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{LOGO}}" alt="Swayamvani Logo" class="logo">
    <div class="brand">Swayamvani</div>
    <div class="brand-tagline">Destination for every musical journey</div>
    <h2>Hello, {{CUSTOMER_NAME}}</h2>
    <p>We received a request to reset the password for your Swayamvani account. Use the secure link below to choose a new password. This link expires in 30 minutes and can be used once.</p>
    <div class="details">
      <p><strong>Email:</strong> {{CUSTOMER_EMAIL}}</p>
    </div>
    <a href="{{RESET_URL}}" class="btn">Set a new password</a>
    <p>If the button does not work, copy and paste this link into your browser:<br><a href="{{RESET_URL}}">{{RESET_URL}}</a></p>
    <p>If you did not ask for this, please contact our support team.</p>
    <div class="footer">
      &copy; 2026 Swayamvani. All rights reserved.<br>
      <a href="https://swayamvani.com" style="color:#2d7a2d;text-decoration:none;">www.swayamvani.com</a>
    </div>
  </div>
</body>
</html>
`
	return strings.NewReplacer(
		"{{LOGO}}", html.EscapeString(swayamvaniLogo),
		"{{CUSTOMER_NAME}}", html.EscapeString(customerName),
		"{{CUSTOMER_EMAIL}}", html.EscapeString(customerEmail),
		"{{RESET_URL}}", html.EscapeString(resetURL),
	).Replace(emailTemplate)
}

func CreatePasswordChangedBody(swayamvaniLogo string, customerName string, customerEmail string, supportEmail string) string {
	const emailTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your Swayamvani password was changed</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;margin:0;padding:24px;color:#33251e">
  <div style="max-width:520px;margin:24px auto;background:#fff;border-radius:8px;padding:32px">
    <img src="{{LOGO}}" alt="Swayamvani Logo" style="display:block;margin:0 auto 16px;width:120px;height:120px;border:3px solid #d9bd82;border-radius:50%;object-fit:cover;background:#000">
    <div style="text-align:center;color:#71351f;font-family:Georgia,serif;font-size:30px;font-weight:bold;line-height:1.1">Swayamvani</div>
    <div style="text-align:center;color:#705b4a;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;margin:7px 0 26px">Destination for every musical journey</div>
    <h2>Hello, {{CUSTOMER_NAME}}</h2>
    <p>The password for your Swayamvani account ({{CUSTOMER_EMAIL}}) was changed successfully.</p>
    <p>If you did not make this change, contact us immediately at <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a>.</p>
    <p style="color:#888;font-size:13px">For your security, this email does not contain your password.</p>
    <p style="text-align:center;color:#888;font-size:13px;margin-top:32px">&copy; 2026 Swayamvani</p>
  </div>
</body>
</html>
`
	return strings.NewReplacer(
		"{{LOGO}}", html.EscapeString(swayamvaniLogo),
		"{{CUSTOMER_NAME}}", html.EscapeString(customerName),
		"{{CUSTOMER_EMAIL}}", html.EscapeString(customerEmail),
		"{{SUPPORT_EMAIL}}", html.EscapeString(supportEmail),
	).Replace(emailTemplate)
}

// CreateOrderInvoiceBody builds the invoice email sent after an order is manually
// confirmed as paid by an administrator.
func CreateOrderInvoiceBody(swayamvaniLogo string, order orders.Order) string {
	var itemRows strings.Builder
	for _, item := range order.Items {
		quantity := item.Quantity
		if quantity < 1 {
			quantity = 1
		}
		fmt.Fprintf(&itemRows, `<tr>
  <td style="padding:10px;border:1px solid #e5d8c8">%s</td>
  <td style="padding:10px;border:1px solid #e5d8c8;text-align:center">%d</td>
  <td style="padding:10px;border:1px solid #e5d8c8;text-align:right">Rs %d</td>
  <td style="padding:10px;border:1px solid #e5d8c8;text-align:right">Rs %d</td>
</tr>`, html.EscapeString(item.Name), quantity, item.Price, item.Price*quantity)
	}
	if itemRows.Len() == 0 {
		itemRows.WriteString(`<tr><td colspan="4" style="padding:10px;border:1px solid #e5d8c8">No items</td></tr>`)
	}

	orderReference := order.OrderNumber
	if orderReference == 0 {
		orderReference = order.ID
	}
	paymentDetails := `Paid — manually confirmed by Swayamvani`
	if strings.TrimSpace(order.PaymentRef) != "" {
		paymentDetails += `<br>Payment reference: ` + html.EscapeString(order.PaymentRef)
	}
	created := ""
	if !order.CreatedAt.IsZero() {
		created = order.CreatedAt.Format("02 Jan 2006, 03:04 PM MST")
	}
	const invoiceTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Payment confirmed — order reference #{{ORDER_REFERENCE}}</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;margin:0;padding:0;color:#33251e">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px">
    <img src="{{LOGO}}" alt="Swayamvani Logo" style="display:block;margin:0 auto 16px;width:120px;height:120px;border:3px solid #d9bd82;border-radius:50%;object-fit:cover;background:#000">
    <div style="color:#71351f;font-size:28px;font-weight:bold;text-align:center;margin-bottom:4px">Swayamvani</div>
    <div style="color:#705b4a;font-size:13px;letter-spacing:1px;text-align:center;margin:0 0 22px">Destination for every musical journey</div>
    <h2>Payment confirmed</h2>
    <p>Your payment has been manually confirmed by Swayamvani. Here is your invoice.</p>
    <div style="background:#f1f8e9;border-radius:6px;padding:16px;margin:24px 0;font-size:14px;line-height:1.6">
      <p><strong>Order reference:</strong> #{{ORDER_REFERENCE}}</p>
      <p><strong>Date:</strong> {{ORDER_DATE}}</p>
      <p><strong>Payment status:</strong> {{PAYMENT_DETAILS}}</p>
      <p><strong>Name:</strong> {{CUSTOMER_NAME}}</p>
      <p><strong>Email:</strong> {{CUSTOMER_EMAIL}}</p>
      <p><strong>Mobile:</strong> {{CUSTOMER_MOBILE}}</p>
      <p><strong>Shipping address:</strong><br>{{SHIPPING_ADDRESS}}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#fff8ef"><th style="padding:8px;border:1px solid #e5d8c8;text-align:left">Item</th><th style="padding:8px;border:1px solid #e5d8c8">Qty</th><th style="padding:8px;border:1px solid #e5d8c8;text-align:right">Unit price</th><th style="padding:8px;border:1px solid #e5d8c8;text-align:right">Amount</th></tr></thead>
      <tbody>{{ITEM_ROWS}}</tbody>
    </table>
    <p style="font-size:16px;text-align:right"><strong>Total paid: Rs {{TOTAL}}</strong></p>
    <p style="color:#888;font-size:13px;margin-top:32px">For help, contact support@swayamvani.com.</p>
    <div style="text-align:center;color:#888;font-size:13px;margin-top:32px">&copy; 2026 Swayamvani. All rights reserved.<br><a href="https://www.swayamvani.com" style="color:#2d7a2d;text-decoration:none">www.swayamvani.com</a></div>
  </div>
</body>
</html>`
	return strings.NewReplacer(
		"{{ORDER_REFERENCE}}", strconv.Itoa(orderReference),
		"{{LOGO}}", html.EscapeString(swayamvaniLogo),
		"{{ORDER_DATE}}", html.EscapeString(created),
		"{{PAYMENT_DETAILS}}", paymentDetails,
		"{{CUSTOMER_NAME}}", html.EscapeString(order.CustomerName),
		"{{CUSTOMER_EMAIL}}", html.EscapeString(order.CustomerEmail),
		"{{CUSTOMER_MOBILE}}", html.EscapeString(order.Mobile),
		"{{SHIPPING_ADDRESS}}", strings.ReplaceAll(html.EscapeString(order.Address), "\n", "<br>"),
		"{{ITEM_ROWS}}", itemRows.String(),
		"{{TOTAL}}", strconv.Itoa(order.Total),
	).Replace(invoiceTemplate)
}
