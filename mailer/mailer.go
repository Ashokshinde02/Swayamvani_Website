package mailer

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/smtp"

	localConfig "swayamvani/config"
)

func SendMail(customerName string, receiptantMailId string, subject string, body string) (bool, error) {

	fmt.Println("In Send Mail")
	decryptedPassword, err := Decrypt(localConfig.EncryptedPassword, localConfig.DecriptionKey)
	if err != nil {
		fmt.Println("Decrypt error:", err)
		return false, err
	}
	fmt.Println("Decrypted:", decryptedPassword)

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

func CreateEmailBody(swayamvaniLogo string, customerName string, customerEmail string, customerPassword string) string {

	emailBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Swayamvani</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; }
    .logo { display: block; margin: 0 auto 20px auto; width: 120px; }
    .brand { color: #2d7a2d; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 16px; }
    .details { background: #f1f8e9; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .details strong { display: inline-block; width: 120px; }
    .footer { text-align: center; color: #888; font-size: 13px; margin-top: 32px; }
    .btn { display: inline-block; background: #2d7a2d; color: #fff; padding: 10px 24px; border-radius: 4px; text-decoration: none; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="%s" alt="Swayamvani Logo" class="logo">
    <div class="brand">Swayamvani</div>
    <h2>Welcome, %s!</h2>
    <p>Your account has been successfully created on <strong>Swayamvani</strong>.</p>
    <div class="details">
      <p><strong>Name:</strong> %s</p>
      <p><strong>Email:</strong> %s</p>
      <p><strong>Password:</strong> %s</p>
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
`, swayamvaniLogo, customerName, customerName, customerEmail, customerPassword)
	return emailBody
}

func CreatePasswordResetBody(swayamvaniLogo string, customerName string, customerEmail string, temporaryPassword string) string {
	emailBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Password Has Been Reset</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px; }
    .logo { display: block; margin: 0 auto 20px auto; width: 120px; }
    .brand { color: #2d7a2d; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 16px; }
    .details { background: #f1f8e9; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .details strong { display: inline-block; width: 130px; }
    .footer { text-align: center; color: #888; font-size: 13px; margin-top: 32px; }
    .btn { display: inline-block; background: #2d7a2d; color: #fff; padding: 10px 24px; border-radius: 4px; text-decoration: none; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="%s" alt="Swayamvani Logo" class="logo">
    <div class="brand">Swayamvani</div>
    <h2>Hello, %s</h2>
    <p>We received a request to reset the password for your Swayamvani account. Use the temporary password below to log in, then update it from your profile.</p>
    <div class="details">
      <p><strong>Email:</strong> %s</p>
      <p><strong>Temporary password:</strong> %s</p>
    </div>
    <a href="https://swayamvani.com/login" class="btn">Sign in</a>
    <p>If you did not ask for this, please contact our support team.</p>
    <div class="footer">
      &copy; 2026 Swayamvani. All rights reserved.<br>
      <a href="https://swayamvani.com" style="color:#2d7a2d;text-decoration:none;">www.swayamvani.com</a>
    </div>
  </div>
</body>
</html>
`, swayamvaniLogo, customerName, customerEmail, temporaryPassword)
	return emailBody
}
