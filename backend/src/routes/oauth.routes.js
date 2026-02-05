import {
  googleAuthController,
  githubAuthController,
  linkedinAuthController,
} from "../controllers/oauth.controller.js";

import { Router } from "express";

const router = Router();

// Login & Signup Route Which Needs Validation Before Save....
router.route("/google").post(googleAuthController);
router.route("/github").post(githubAuthController);
router.route("/linkedin").post(linkedinAuthController);

export default router;
