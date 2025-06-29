import { healthCheck } from "../controllers/healthcheck.controllers.js";
import { Router } from "express";

const router = Router();

router.route("/").get(healthCheck);

export default router;
