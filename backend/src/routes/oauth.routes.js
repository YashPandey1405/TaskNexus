import { googleAuthController } from "../controllers/oauth.controller.js";

import { Router } from "express";

const router = Router();

// Login & Signup Route Which Needs Validation Before Save....
router.route("/google").post(googleAuthController);

export default router;
