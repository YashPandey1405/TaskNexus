# React Router + Express API In MERN Stack

## ✅ Flow Recap (what you said, simplified):

1. User goes to `/login` → React Router renders `Login` component
2. User submits login form → React sends `POST /login` to backend
3. Backend returns success → React redirects to `/me`
4. `/me` is handled by React Router and renders the `Profile` component
5. `Profile` fetches user data from `/api/me`

---

## 🔍 Code Breakdown

### 📁 Frontend (React)

#### 🛣️ App.js

```jsx
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

#### 🧾 Login.js

```jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { email, password });
      if (res.data.success) {
        navigate("/me"); // ✅ Redirect on success
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Error: " + err.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
```

---

#### 👤 Profile.js

```jsx
import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("/api/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default Profile;
```

---

### 🛠️ Backend Example (Express)

```js
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Optional: Send token or session cookie
  res.json({ success: true });
});

app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});
```
