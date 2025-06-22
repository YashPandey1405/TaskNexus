import app from "./app.js";
import dotenv from "dotenv";
import DB_Connect from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8080;

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
    exposedHeaders: ["Set-Cookie", "*"],
  }),
);

// Calling The 'DB_Connect' Method To Link With Database....
DB_Connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Not Connected", err);
    process.exit(1);
  });
