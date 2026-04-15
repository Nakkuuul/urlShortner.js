# API Reference

Base URL: `https://yourdomain.com/api/v1`

---

## Authentication

Protected endpoints require a Bearer token obtained from the login endpoint.

```
Authorization: Bearer <token>
```

Tokens expire after **24 hours**.

---

## Auth

### Register

Creates a new user account.

```
POST /auth/register
```

**Request body**

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `username` | string | ✓        | Unique username          |
| `email`    | string | ✓        | Unique email address     |
| `password` | string | ✓        | Plain-text password      |

**Example request**

```json
{
  "username": "nakul",
  "email": "nakul@example.com",
  "password": "secret123"
}
```

**Responses**

`201 Created`
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "username": "nakul",
    "email": "nakul@example.com"
  }
}
```

`400 Bad Request` — missing field or duplicate username/email
```json
{
  "success": false,
  "message": "Username or Email already exists"
}
```

---

### Login

Authenticates a user and returns a JWT.

```
POST /auth/login
```

**Request body**

| Field      | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| `email`    | string | ✓        | Registered email     |
| `password` | string | ✓        | Account password     |

**Example request**

```json
{
  "email": "nakul@example.com",
  "password": "secret123"
}
```

**Responses**

`200 OK`
```json
{
  "success": true,
  "message": "User logged-in successfully",
  "data": {
    "id": "664f1c2e8a1b2c3d4e5f6a7b",
    "username": "nakul",
    "email": "nakul@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

`400 Bad Request` — missing field or wrong credentials
```json
{
  "success": false,
  "message": "Invalid Credentials"
}
```

---

## URL Shortener

### Shorten a URL

Creates a short code for a given URL. Requires authentication.

```
POST /url/shorten
```

**Headers**

```
Authorization: Bearer <token>
```

**Request body**

| Field         | Type   | Required | Description                                              |
|---------------|--------|----------|----------------------------------------------------------|
| `originalUrl` | string | ✓        | The full URL to shorten                                  |
| `shortCode`   | string | ✗        | Custom short code. Auto-generated (8 hex chars) if omitted |
| `expiry`      | string | ✗        | ISO 8601 expiry date. Link becomes inactive after this   |

**Example request — auto-generated code**

```json
{
  "originalUrl": "https://www.example.com/some/very/long/path"
}
```

**Example request — custom code with expiry**

```json
{
  "originalUrl": "https://www.example.com/some/very/long/path",
  "shortCode": "sale50",
  "expiry": "2025-12-31T23:59:59Z"
}
```

**Responses**

`201 Created`
```json
{
  "success": true,
  "message": "URL registered successfully",
  "data": {
    "shortURL": "https://yourdomain.com/sale50",
    "originalUrl": "https://www.example.com/some/very/long/path"
  }
}
```

`400 Bad Request` — missing URL or duplicate short code
```json
{
  "success": false,
  "message": "Short code already exists"
}
```

`401 Unauthorized` — missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### Redirect

Resolves a short code and redirects to the original URL. Increments the click counter on each visit.

```
GET /url/:shortCode
```

> **Note:** In a production deployment this route is typically served from the root domain (e.g. `https://yourdomain.com/:shortCode`) rather than under `/api/v1/url/`.

**Path parameters**

| Parameter   | Type   | Description              |
|-------------|--------|--------------------------|
| `shortCode` | string | The short code to resolve |

**Responses**

`302 Found` — redirects to `originalUrl`

`404 Not Found` — short code does not exist
```json
{
  "success": false,
  "message": "Short Code not found"
}
```

`410 Gone` — link has passed its expiry date
```json
{
  "success": false,
  "message": "Link has expired"
}
```

---

## Error Reference

All error responses follow a consistent shape:

```json
{
  "success": false,
  "message": "<reason>"
}
```

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `400`  | Bad request — validation failed or duplicate |
| `401`  | Unauthorized — token missing or invalid      |
| `404`  | Resource not found                           |
| `410`  | Gone — link has expired                      |
| `500`  | Internal server error                        |

---

## Data Models

### User

| Field       | Type     | Notes                    |
|-------------|----------|--------------------------|
| `_id`       | ObjectId | Auto-generated           |
| `username`  | string   | Unique                   |
| `email`     | string   | Unique, lowercased       |
| `password`  | string   | Bcrypt hashed            |
| `createdAt` | Date     | Auto-managed by Mongoose |
| `updatedAt` | Date     | Auto-managed by Mongoose |

### URL

| Field         | Type     | Notes                             |
|---------------|----------|-----------------------------------|
| `_id`         | ObjectId | Auto-generated                    |
| `shortCode`   | string   | Unique, indexed                   |
| `originalUrl` | string   | The destination URL               |
| `clicks`      | number   | Incremented on each redirect      |
| `expiresAt`   | Date     | `null` means the link never expires |
| `createdAt`   | Date     | Auto-managed by Mongoose          |
| `updatedAt`   | Date     | Auto-managed by Mongoose          |