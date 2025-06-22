import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authorizationRoute from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import noteRoutes from "./routes/note.routes.js";

const app = express();

// Important To Read The JSON & Form data.....
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS Configuration – Enables frontend (React) to talk to backend (Express)
app.use(
  cors({
    // 🔗 Allow only this origin (your frontend URL) to access backend APIs
    // 🍪 Allow cookies and credentials (like JWT, session cookies) to be sent
    // 🧾 Methods allowed from the frontend
    // 📦 Headers allowed in requests from frontend to backend
    // 📤 Headers allowed to be exposed to the frontend (useful for tokens/cookies)

    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    // exposedHeaders: ["Set-Cookie", "*"],
  }),
);

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
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/note", noteRoutes);

// Finally adding the error handler at the very bottom
// This Will Improve The Readability Of The Api-Errors.....
app.use(errorMiddleware);

export default app;
