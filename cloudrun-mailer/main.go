package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type mailRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func main() {
	http.HandleFunc("/send-welcome-mail", sendWelcomeMailHandler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("starting mailer worker on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}

func sendWelcomeMailHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload mailRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.Password) == "" {
		http.Error(w, "name, email, and password are required", http.StatusBadRequest)
		return
	}

	if err := sendTitanEmail(payload); err != nil {
		log.Printf("mail worker: %v", err)
		http.Error(w, "failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func sendTitanEmail(payload mailRequest) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpFrom := os.Getenv("SMTP_FROM")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpHost == "" || smtpPort == "" || smtpFrom == "" || smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("smtp credentials not configured")
	}

	subject := "Welcome to Swayamvani! Your Account Has Been Created"
	body := createEmailBody(payload.Name, payload.Email, payload.Password)

	msg := "From: " + smtpFrom + "\r\n" +
		"To: " + payload.Email + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0;\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
		body

	conn, err := net.DialTimeout("tcp", net.JoinHostPort(smtpHost, smtpPort), 10*time.Second)
	if err != nil {
		return fmt.Errorf("dial smtp: %w", err)
	}
	defer conn.Close()

	c, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer c.Close()

	if ok, _ := c.Extension("STARTTLS"); ok {
		if err := c.StartTLS(&tls.Config{ServerName: smtpHost}); err != nil {
			return fmt.Errorf("starttls: %w", err)
		}
	}

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	if err := c.Auth(auth); err != nil {
		return fmt.Errorf("auth: %w", err)
	}

	if err := c.Mail(smtpFrom); err != nil {
		return fmt.Errorf("mail from: %w", err)
	}
	if err := c.Rcpt(payload.Email); err != nil {
		return fmt.Errorf("rcpt: %w", err)
	}

	w, err := c.Data()
	if err != nil {
		return fmt.Errorf("data: %w", err)
	}
	if _, err := io.Copy(w, bytes.NewBufferString(msg)); err != nil {
		return fmt.Errorf("write body: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("close data: %w", err)
	}

	return c.Quit()
}

func createEmailBody(name, email, password string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Swayamvani</title>
</head>
<body>
  <p>Hi %s,</p>
  <p>Your account has been created. Your login details are:</p>
  <ul>
    <li>Email: %s</li>
    <li>Password: %s</li>
  </ul>
  <p><a href="https://swayamvani.com/login">Log in to your account</a></p>
</body>
</html>`, name, email, password)
}
