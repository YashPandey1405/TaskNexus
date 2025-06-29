# 📘 React Routing – Quick Implementation Guide

This guide outlines how to implement basic routing in a React application using **React Router**. Follow the steps below to enable multiple page navigation without full page reloads.

---

### ✅ 1. Install React Router

Install `react-router-dom` via npm:

```bash
npm install react-router-dom
```

> Make sure you're using `react-router-dom` (not just `react-router`) in React projects.

---

### ✅ 2. Set Up Routes in `main.jsx`

Define your application's routes using the `BrowserRouter`, `Routes`, and `Route` components from `react-router-dom`.

```jsx
// main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // ✅ Use 'react-router-dom'
import App from "./App.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import SignupForm from "./pages/SignupForm.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
```

---

### ✅ 3. Navigation – Use `<Link>` Instead of `<a>`

Avoid using `<a href="/login">` for navigation — it causes a full page reload.

Instead, use the `Link` component from `react-router-dom`:

```jsx
import React from "react";
import { Link } from "react-router-dom"; // ✅ Correct import

const Navbar = () => {
  return (
    <nav>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </nav>
  );
};
```

---

### 🧠 Summary

- `react-router-dom` enables SPA-style routing in React.
- Define your route structure in `main.jsx` using `<BrowserRouter>`.
- Use `<Link>` for internal navigation to prevent full page reloads.
