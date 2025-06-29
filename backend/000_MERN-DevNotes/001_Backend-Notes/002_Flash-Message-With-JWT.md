# JWT Authentication with Flash Messages

This project demonstrates how to implement **flash messages** using **JWT tokens** for user authentication. Flash messages are displayed to the user after successful actions (like login or signup) and are stored in cookies.

## Features

- **Flash messages**: Temporary messages shown to the user after actions like login or signup.
- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **Cookie-based storage**: JWT tokens and flash messages are stored in cookies for persistence.

## Implementation of Flash Messages with JWT

Got it, here's an improved and more readable version of **only the section you provided**:

---

### 1. **Your Controller & Route**

- When a user signs up or logs in, the server generates **access** and **refresh** tokens and stores them in cookies.
- A **flash message** is also stored in a temporary cookie to notify the user of successful action.

---

#### ✅ Example: `/signup` Controller Redirects to `/me` With Flash Message

```js
app.post("/signup", async (req, res) => {
  // Handle user signup logic...

  // Store flash message & tokens in cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("flashMessage", "Signup successful!", {
      maxAge: 60000, // Expires in 1 minute
      httpOnly: true,
    })
    .redirect("/me"); // Redirect to /me after signup
});
```

---

#### ✅ `/me` Controller to Read & Clear Flash Message

```js
app.get("/me", async (req, res) => {
  const flashMessage = req.cookies.flashMessage;

  res.clearCookie("flashMessage"); // Clear after reading

  res.render("PostLoginWelcome.ejs", {
    flashMessage, // Send to EJS
    // Add any user data if needed
  });
});
```

### 2. **Rendering Flash Message in EJS**

- The flash message is rendered on the frontend by checking if a **flashMessage** cookie exists.

#### Example `PostLoginWelcome.ejs`:

```js
<% if (flashMessage) { %>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <strong>Made With ❤️ By Yash Pandey!</strong> <%= flashMessage %>
    <button type="button" class="btn-close" data-bs-dismiss="alert"aria-label="Close"></button>
  </div>
<% } %>
```

### 3. **Flash Message Middleware**

- A middleware function is used to read and clear the **flashMessage** cookie.

#### Example Middleware:

```js
app.use((req, res, next) => {
  if (req.cookies.flashMessage) {
    res.locals.flashMessage = req.cookies.flashMessage;
    res.clearCookie("flashMessage"); // Remove the message after it's displayed
  }
  next();
});
```

---

## Summary

- **JWT tokens** are used for user authentication (access and refresh tokens).
- **Flash messages** are stored in cookies and used to provide feedback to the user after actions like login and signup.
- Flash messages are displayed in EJS views and cleared after the user sees them.
- Cookies are set with **httpOnly** flag for security.
