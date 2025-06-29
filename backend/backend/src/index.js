import app from "./app.js";
import dotenv from "dotenv";
import DB_Connect from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8080;

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
