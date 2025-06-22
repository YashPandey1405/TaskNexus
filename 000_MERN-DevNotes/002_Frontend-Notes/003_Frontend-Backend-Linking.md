# 🔗 Connecting Frontend (React) with Backend (Node.js + Express)

This guide provides a structured approach to seamlessly connect a React frontend with a Node.js + Express backend using `CORS`, `fetch`, and a clean API layer.

---

## ⚙️ Step-by-Step Setup

### ✅ 1. Backend Setup with CORS

Install `cors` in your backend:

```bash
npm install cors
```

Set up CORS middleware in your backend (e.g., `server/index.js`):

```js
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173", // React dev server URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  }),
);
```

This configuration enables cross-origin requests from the frontend and ensures cookies (if any) are properly handled.

---

### 🌐 2. Create an API Client in React

Create a file `src/services/apiClient.js` in your React app to centralize all API calls:

```js
class ApiClient {
  constructor() {
    this.baseURL = "http://localhost:8080"; // Your backend URL
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async customFetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...options.headers };

      const config = {
        ...options,
        headers,
        credentials: "include", // Required for sending cookies/session data
      };

      console.log(`Fetching ${url}`);
      const response = await fetch(url, config);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Sample Login Endpoints

  async login(loginUserName, loginEmail, loginPassword) {
    return this.customFetch("/login", {
      method: "POST",
      body: JSON.stringify({ loginUserName, loginEmail, loginPassword }),
    });
  }

  async getLoginPage() {
    return this.customFetch("/login");
  }
}

const apiClient = new ApiClient();
export default apiClient;
```

---

### 🧩 3. Using the API Client in Components

Import and use `apiClient` inside any React component:

```js
import apiClient from "../../services/apiClient";

const handleLogin = async () => {
  try {
    const response = await apiClient.login(name, email, password);
    console.log("Login Successful", response);
  } catch (error) {
    console.error("Login Failed", error);
  }
};

const fetchLoginPage = async () => {
  const response = await apiClient.getLoginPage();
  console.log("GET /login response:", response);
};
```

---

## 🛡️ Tips for a Smooth Integration

- Always run both servers (React & Express) simultaneously during development.
- Use `.env` files to store API URLs and switch easily between dev and production.
- Make sure cookies are configured correctly if you're using sessions/authentication.
- Keep your `apiClient` generic and scalable—add more methods as your backend grows.
