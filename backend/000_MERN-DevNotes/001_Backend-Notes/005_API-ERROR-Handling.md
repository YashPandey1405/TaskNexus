## 🛠️ Error Handling in TaskNexus

To maintain consistency and clarity in server responses, this project uses a custom **API Error Handling** system. This makes it easy to debug during development and ensures the frontend receives meaningful, structured error messages.

---

### 📦 Components Involved

#### 1. `ApiError` Class

A custom error class that extends the default `Error` and allows sending structured error objects.

```js
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

**Example usage in controller:**

```js
throw new ApiError(400, "Invalid login credentials", [
  { field: "email", message: "Email not found" },
]);
```

---

#### 2. Error Handling Middleware

This is registered **at the very end** of your Express app. It catches any thrown `ApiError` and sends a structured JSON response.

```js
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    message: err.message || "Internal Server Error",
    success: false,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Register as the last middleware
app.use(errorMiddleware);
```

---

### ✅ Sample Error Response

```json
{
  "statusCode": 500,
  "message": "Internal server error in login controller",
  "success": false,
  "errors": [
    {
      "field": "login",
      "message": "Something went wrong while logging in"
    }
  ]
}
```

---

### 💡 Benefits

- **Uniform structure** for all errors.
- Easy to debug in development using `stack`.
- Clear field-specific messages help with frontend validation.
