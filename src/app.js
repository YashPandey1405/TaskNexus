import express from "express";
import cookieParser from "cookie-parser";

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authorizationRoute from "./routes/auth.routes.js";

const app = express();

// Important To Read The JSON & Form data.....
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Error Handling Middleware Which Will Handle All The Errors In The Application.....
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode: statusCode,
    message: err.message || "Internal Server Error",
    success: false,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // optional
  });
};

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authorizationRoute);

// Finally adding the error handler at the very bottom
// This Will Improve The Readability Of The Api-Errors.....
app.use(errorMiddleware);

export default app;
