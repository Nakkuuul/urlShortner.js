# snip. — URL Shortener

A full-stack URL shortener with JWT authentication, custom short codes, expiry dates, and click tracking.

---

## Stack

**Backend** — Node.js, Express, MongoDB (Mongoose), JWT, bcrypt  
**Frontend** — Vanilla HTML/CSS/JS (no framework, no build step)

---

## Project Structure

```
urlShortner/
├── src/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── env.js         # Environment variable validation
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── url.controller.js
│   ├── middleware/
│   │   └── auth.js        # JWT verification middleware
│   ├── models/
│   │   ├── user.model.js
│   │   └── url.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── url.routes.js
│   └── app.js
├── urlshortner-frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── server.js
├── .env
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/your-username/urlShortner.git
cd urlShortner
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
PORT=5000
MONGOOSE_URI=mongodb://localhost:27017/urlshortner
JWT_SECRET=your_super_secret_key
DOMAIN=http://localhost:5000
```

| Variable       | Description                                      |
|----------------|--------------------------------------------------|
| `PORT`         | Port the server listens on                       |
| `MONGOOSE_URI` | MongoDB connection string                        |
| `JWT_SECRET`   | Secret used to sign and verify JWTs             |
| `DOMAIN`       | Base URL prepended to generated short codes      |

### 3. Run the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`.

### 4. Open the frontend

Point `API_BASE` in `urlshortner-frontend/js/app.js` to your server:

```js
const API_BASE = "http://localhost:5000/api/v1";
```

Then open `urlshortner-frontend/index.html` directly in your browser — no build step needed.

---

## API Reference

Full documentation in [`api.md`](./api.md). Quick summary:

| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | `/api/v1/auth/register`| —    | Create a new account     |
| POST   | `/api/v1/auth/login`   | —    | Login and receive a JWT  |
| POST   | `/api/v1/url/shorten`  | ✓    | Shorten a URL            |
| GET    | `/api/v1/url/:shortCode` | —  | Redirect to original URL |

Protected endpoints require:
```
Authorization: Bearer <token>
```

---

## Features

- **Authentication** — Register and login with JWT tokens (24h expiry)
- **URL Shortening** — Auto-generated or custom short codes
- **Link Expiry** — Set an optional expiry date on any link
- **Click Tracking** — Each redirect increments a click counter
- **Duplicate Detection** — Rejects duplicate short codes with a clear error
- **Frontend** — Single-page UI with auth, shortening, copy-to-clipboard, and link history

---

## Scripts

```bash
npm run dev     # Start with nodemon (hot reload)
npm start       # Start in production mode
```

---

## Environment Notes

- The server will **throw an error on startup** if any required env variable is missing — this is intentional.
- `JWT_SECRET` should be a long, random string in production. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- For production, set `DOMAIN` to your actual domain (e.g. `https://snip.yourdomain.com`) so generated short URLs are correct.

---

## Known Limitations

- Links are not currently associated with users — there is no "my links" endpoint.
- The frontend stores link history in `localStorage` only; it is not fetched from the server.
- The redirect route is nested under `/api/v1/url/` — for cleaner short URLs in production, mount it at the root domain separately.