# 🔐 Auth Routes - TaskNexus API (Postman Collection)

This Postman collection focuses on the **Authentication & Authorization** layer of the TaskNexus platform. It includes all major user-related functionalities — from registration to secure login, password reset, and email verification.

---

## 📁 Included Controller Files & Descriptions

### 1. `RegisterUser-Controller.md`

- Handles new user registration via email and password.
- Validates inputs and sends verification email upon signup.

### 2. `loginUser-Controller.md`

- Authenticates users via credentials and issues a JWT.
- Stores secure login session via cookies or headers.

### 3. `logoutUser-Controller.md`

- Clears user session and invalidates JWT on logout.
- Ensures proper client-side cleanup through response.

### 4. `getUser-Controller.md`

- Fetches authenticated user details using JWT.
- Requires active session; used for protected routes.

### 5. `VerifyEmail-Controller.md`

- Verifies user email using a secure token.
- Activated through a verification link sent via mail.

### 6. `Forgot-Password-Controller.md`

- Sends a reset password link to the registered email.
- Secure token is used to reset password within a time window.

### 7. `changePassword-Controller.md`

- Allows authenticated users to change their password.
- Validates old password and updates securely in DB.

---

## 🚀 How to Use This Collection

- Import into Postman
- Use `Register` and `Login` to test authentication flow
- Add `Bearer Token` to secured routes (e.g., getUser, changePassword)
- Use `Forgot` → `Verify` → `Change` flow to simulate password recovery

---

## 🧰 Status

✅ All Auth Routes Tested via Postman  
🔐 Secure JWT & Middleware Integration  
📩 Email-based verification and password reset included
