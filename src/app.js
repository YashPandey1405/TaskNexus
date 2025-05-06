import express from "express";
import cookieParser from "cookie-parser";

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import router from "./routes/auth.routes.js";

const app = express();

// Important To Read The JSON & Form data.....
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", router);

export default app;
