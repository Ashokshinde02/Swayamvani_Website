# स्वयंवाणी Website (Go Backend + Admin)

Branding note:
- Place your uploaded logo at `logo.jpeg` to show it in header across storefront, demo, and admin.

## Run

```bash
go run .
```

Open storefront: http://localhost:8080  
Open admin: http://localhost:8080/admin
Health endpoint: http://localhost:8080/healthz

## Run with Docker (no local Go needed)

```bash
docker compose up --build
```

Open storefront: http://localhost:8080  
Open admin: http://localhost:8080/admin
Health endpoint: http://localhost:8080/healthz

Check container health:

```bash
docker compose ps
curl http://localhost:8080/healthz
```

Default Docker admin credentials:
- username: `admin`
- password: `admin123`

## Configuration

- `PORT` (default: `8080`)
- `ADMIN_USER` (default: `admin`)
- `ADMIN_PASSWORD` (default fallback for local: `admin123`)
- `DB_VENDOR` (`postgres` or `mysql`)
- `DB_DSN` (database DSN)
- `RAZORPAY_KEY_ID` (optional)
- `RAZORPAY_KEY_SECRET` (optional)
- `MAILER_WORKER_URL` (optional HTTP endpoint that delivers Titan SMTP emails)
- `MAILER_WORKER_API_KEY` (optional shared secret expected by the worker)

If `DB_VENDOR` or `DB_DSN` is missing, app runs with in-memory storage.

If Razorpay keys are missing, checkout falls back to WhatsApp order flow.

You can copy `.env.example` to `.env` and set your values.

## PostgreSQL example

```bash
export DB_VENDOR=postgres
export DB_DSN='postgres://user:pass@localhost:5432/swayamvani?sslmode=disable'
export ADMIN_USER='admin'
export ADMIN_PASSWORD='change-me'
export RAZORPAY_KEY_ID='rzp_test_xxx'
export RAZORPAY_KEY_SECRET='xxx'
go run .
```

## MySQL example

```bash
export DB_VENDOR=mysql
export DB_DSN='user:pass@tcp(127.0.0.1:3306)/swayamvani?parseTime=true'
export ADMIN_USER='admin'
export ADMIN_PASSWORD='change-me'
go run .
```

## API Endpoints

Public:
- `GET /api/products`
- `GET /api/videos`
- `POST /api/inquiry`
- `POST /api/checkout` (WhatsApp flow)
- `POST /api/payment/razorpay/order`

Admin auth:
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`

Customer auth:
- `POST /api/customer/register`
- `POST /api/customer/login`
- `POST /api/customer/logout`
- `GET /api/customer/me`

Admin data (session cookie required):
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/videos`
- `POST /api/admin/videos`
- `DELETE /api/admin/videos/:id`
- `GET /api/admin/inquiries`

Product media rule:
- Each product must have minimum 5 photo URLs (`images`) and 1 making video URL (`video_url`).

Inquiries are also appended to `data/inquiries.log`.

## Mailer worker (Cloud Run)

- The `cloudrun-mailer` folder contains a self-contained Go worker that exposes `/send-welcome-mail` (POST) and reconnects to Titan SMTP via STARTTLS on port 587.
- Deploy it to Cloud Run (paid project) and configure the following environment variables:
  - `SMTP_HOST`, `SMTP_PORT` (e.g., `smtp.titan.email`, `587`)
  - `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - `PORT` (Cloud Run default 8080)
- Protect it with Cloud Run IAM or an API key; the Render app sends the customer data and optional `MAILER_WORKER_API_KEY` header to this worker so Titan credentials stay off Render.
- When the worker succeeds it returns `200 OK`, otherwise it logs the SMTP error in Stackdriver and returns a 500 so the Render app can retry.
