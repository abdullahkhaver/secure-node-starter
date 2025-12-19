#  Secure Node.js Backend Starter

Opinionated starter repo for a **secure Node.js + Express API**, aimed at beginners who want production-ready security practices built-in.

 **Important:** No system can ever be *100% unhackable*. This repo implements **modern, pragmatic security best practices** to make attacks more difficult and reduce risk. See [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md) for additional steps you must apply before production.

---

## 📖 Based on the Secure MERN/Node Handbook

This starter system is built on top of the **Secure Node/MERN Handbook**, which provides a step-by-step guide to setting up a backend with security by default.
It follows the principles and patterns described in the handbook, ensuring that developers have a **ready-to-use, hardened foundation** for building APIs.

If you’re using this starter, I strongly recommend reading through the handbook for deeper understanding and customization.The Handbook is attached to this repo.

##  What this includes

*  **Express app** with:

  * Helmet (secure headers)
  * Rate limiting
  * CORS
  * Basic CSRF protection
*  **Authentication** (register/login/refresh/logout):

  * Argon2 password hashing
  * Rotated refresh tokens
  * JWT access tokens stored in cookies
*  **Mongoose-based User model** (secure defaults, no password leaks)
*  **Auth middleware** (`auth.js`) to protect routes
*  **Dockerfile + docker-compose** (local dev with MongoDB)
*  **GitHub Actions** example (lint, test, CodeQL, Dependabot)
*  `.env.example` with **secure defaults**

---

##  Quick start (local)

1. Copy environment example:

   ```bash
   cp .env.example .env
   ```

   Fill in the secrets:

   * `JWT_ACCESS_SECRET` (long, random string — e.g. from `openssl rand -base64 64`)
   * `JWT_REFRESH_SECRET`
   * `MONGO_URI`

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. API available at:

   ```
   http://localhost:3000/api
   ```

---

##  Authentication flow

### 1. Register

`POST /api/auth/register`
Body:

```json
{
  "username": "alice",
  "password": "superStrongPassword123"
}
```

### 2. Login

`POST /api/auth/login`
Returns:

* `access_token` (JWT) in **httpOnly cookie**
* `refresh_token` (rotating token in DB)

### 3. Access protected routes

Use the `auth.js` middleware to secure endpoints:

```js
const express = require('express');
const auth = require('./middleware/auth');
const router = express.Router();

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
```

 This middleware:

* Extracts `access_token` from cookies
* Verifies it with `JWT_ACCESS_SECRET`
* Loads user from DB (without password/refreshTokens)
* Attaches `req.user` to downstream handlers

If the token is missing or invalid, returns `401 Unauthorized`.

### 4. Refresh & logout

* `POST /api/auth/refresh` → new `access_token`
* `POST /api/auth/logout` → clears cookies & refresh token

---

##  Files included

* `middleware/auth.js` → Auth guard for protected routes
* `models/user.model.js` → Secure Mongoose user schema
* `routes/auth.js` → Register/login/refresh/logout endpoints
* `server.js` → App entrypoint
* `Dockerfile` + `docker-compose.yml`
* `.env.example` → Copy to `.env`

---

##  Notes

* This repo is a **starter**, not a final product.
* Before going to production:

  * Review [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md)
  * Enable HTTPS everywhere
  * Set `SameSite=strict` cookies
  * Harden MongoDB + server environment

---


##  Running Tests

```bash
npm test
```

---

##  Available Scripts

* `npm run dev` → Run with auto-restart (Nodemon).
* `npm start` → Run in production mode.
* `npm run lint` → Run ESLint to catch code issues.
* `npm test` → Run Jest tests.

---

##  License

MIT License © 2025 -  Muhammad Abdullah Khaver

---
