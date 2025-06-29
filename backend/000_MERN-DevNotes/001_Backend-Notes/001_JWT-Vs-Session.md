# 🔐 JWT vs Session – Authentication Guide

This project explains how **JWT (JSON Web Token)** and **Session-based Authentication** work, especially in the context of Login & Signup functionalities. It also highlights the differences between Authentication & Authorization and how to securely manage access using cookies.

---

## 📘 What is JWT?

**JWT (JSON Web Token)** is a compact, URL-safe means of representing claims to be transferred between two parties. It's commonly used for **authentication and authorization** in web applications.

### ✅ Structure of a JWT:

A JWT consists of **three parts**:

1. **Header** – Defines the algorithm used (e.g., HS256)
2. **Payload** – Contains user data (_e.g.,_ `id`, `name`, `email`)
3. **Signature** – Verifies the token’s authenticity

JWT tokens are usually encrypted and stored in cookies with:

- `httpOnly: true`
- `secure: true`  
  This ensures the token is not accessible via JavaScript and is transmitted only over HTTPS.

---

## 🔑 Authentication vs Authorization

| Concept            | Description                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **Authentication** | Verifying the user’s identity (e.g., Login). Doesn’t grant access to protected resources. |
| **Authorization**  | Grants access to specific resources based on user’s role/permissions.                     |

---

## 🔄 JWT Token Types

To manage user sessions securely, two types of tokens are typically used:

1. **Access Token**
   - Short-lived (e.g., 15 mins)
   - Stored in cookies
   - Used to access protected routes/resources
2. **Refresh Token**
   - Long-lived (e.g., 7 days)
   - Stored in cookies _and_ database
   - Used to regenerate new access tokens when they expire

### 🔁 Refresh Flow

When the **access token** expires:

1. Client sends the **refresh token**
2. Server validates the refresh token
3. If valid, a **new access token** is issued

---

## ⚔️ JWT vs Session

| Feature           | JWT (Stateless)                            | Session (Stateful)                                 |
| ----------------- | ------------------------------------------ | -------------------------------------------------- |
| Storage           | Token stored in cookie / localStorage      | Session data stored in the database                |
| Server Load       | No DB call needed for token validation     | Requires DB call to validate each request          |
| Scalability       | High – easier to scale apps                | Lower – session management can become a bottleneck |
| Refresh Mechanism | Access/Refresh tokens with expiry strategy | Session expiry based on activity or timeout        |

---

## ✅ Best Practices

- Always use **`httpOnly`** and **`secure`** flags for cookies
- Keep **access tokens short-lived**
- Store **refresh tokens securely in DB**
- Use **HTTPS** in production
- Regularly rotate and invalidate tokens when necessary
