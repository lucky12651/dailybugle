# URL Shortener Application

A full-stack URL shortener application built with **Node.js, React, and PostgreSQL**.

---

## Features

* Shorten long URLs with custom or auto-generated slugs
* Server-side redirects (SEO & social media crawler friendly)
* Click analytics and tracking
* Recent links history
* Copy-to-clipboard support
* Responsive UI

---

## Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL
* **Frontend**: React, Vite, Tailwind CSS

---

## Database Schema (PostgreSQL)

### `urls` table

```sql
id SERIAL PRIMARY KEY,
slug VARCHAR(255) UNIQUE NOT NULL,
long_url TEXT NOT NULL,
clicks INTEGER DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `clicks` table

```sql
id SERIAL PRIMARY KEY,
slug VARCHAR(255),
ip VARCHAR(45),
user_agent TEXT,
referer TEXT,
country VARCHAR(10),
location TEXT,
is_bot BOOLEAN DEFAULT false,
device_info JSONB,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Setup Instructions

### Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* PostgreSQL (v12 or higher)

---

## Backend Setup

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up PostgreSQL:

   * Create a PostgreSQL database
   * Run the SQL schema provided above
   * Note your database credentials

4. Create a `.env` file in the `server` directory:

   ```env
   PORT=3000
   BASE_URL=http://localhost:3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

5. Start the server:

   ```bash
   npm start
   ```

---

## Frontend Setup

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

---

## API Endpoints

* `POST /api/shorten` – Create a shortened URL
* `GET /:slug` – Redirect to the original URL
* `GET /api/recent` – Get recently created URLs
* `GET /api/stats/:slug` – Get analytics for a specific URL

---

## Environment Variables

### Server (`.env`)

* `PORT` – Server port (default: 3000)
* `BASE_URL` – Base URL for generating short links
* `DB_HOST` – PostgreSQL host
* `DB_PORT` – PostgreSQL port
* `DB_NAME` – Database name
* `DB_USER` – Database user
* `DB_PASSWORD` – Database password

---

## Deployment

For production deployment:

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Serve the frontend build via:

   * Nginx
   * Express static files
   * CDN (optional)

3. Set production environment variables on the server

4. Use a reverse proxy (Nginx/Apache) if required

5. Enable HTTPS for security

---

## Security Considerations

* Never commit `.env` files to version control
* Use strong database credentials
* Implement rate limiting to prevent abuse
* Sanitize inputs to avoid SQL injection
* Consider authentication for managing personal links

---

## Contributing

Contributions, issues, and feature requests are welcome.