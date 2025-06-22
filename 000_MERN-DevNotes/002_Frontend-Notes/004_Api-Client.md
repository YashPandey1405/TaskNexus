# 📦 ApiClient – Centralized API Utility for Loginfy-MERN

This file defines a reusable `ApiClient` class for handling all API requests in your frontend. It helps avoid repeating code and ensures consistent headers, base URL, and cookie handling.

---

## 🔍 What's Inside?

```js
class ApiClient {
  constructor() {
    this.baseURL = "http://localhost:8080";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
```

### 🔸 `constructor()`

- Sets the **base URL** for your backend.
- Pre-defines commonly used headers for all requests (`Content-Type`, `Accept`).

---

```js
  async customFetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...options.headers };

      const config = {
        ...options,
        headers,
        credentials: "include",
      };
```

### 🔸 `customFetch(endpoint, options)`

- A **core function** to make HTTP requests.
- Builds the **full URL** from `baseURL + endpoint`.
- Merges default headers with any custom ones you pass.
- Uses `credentials: "include"` to **send cookies or session tokens**.

---

```js
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error", error);
      throw error;
    }
  }
```

- Uses native `fetch()` to call the API.
- Parses and returns the response as **JSON**.
- Logs and throws errors if anything fails.

---

## 🔐 Authentication Methods

```js
  async signup(name, email, password) {
    return this.customFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }
```

### ✅ `signup(name, email, password)`

Sends a POST request to `/signup` with the user’s data.

---

```js
  async login(email, password) {
    return this.customFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }
```

### ✅ `login(email, password)`

Sends a POST request to `/login` to authenticate a user.

---

```js
  async getProfiles() {
    return this.customFetch("/me");
  }
```

### ✅ `getProfiles()`

Makes a GET request to `/me` to **fetch logged-in user data**. Because it includes cookies, this works well with JWT/session-based auth.

---

## 📤 Exporting the Client

```js
const apiClient = new ApiClient();
export default apiClient;
```

- Creates a **single instance** of the class so it can be used across your app.
- Just `import apiClient from "./services/apiClient";` wherever you need to make API calls.

---

## 🧠 Benefits of This Structure

- ✅ Clean and DRY code
- ✅ Centralized API config
- ✅ Easy error tracking
- ✅ Cookie/session support
- ✅ Scalable – just add more methods as needed!
