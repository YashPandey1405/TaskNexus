import {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  resendEmailVerification,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";

// Express-Validator Import.....
import {
  userRegistrationValidator,
  userLoginValidator,
} from "../validatores/index.js";

// Middlewares Import.....
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();

// Login & Signup Route Which Needs Validation Before Save....
router.route("/login").post(userLoginValidator(), validate, loginUser);
router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.route("/resend-token").get(refreshAccessToken);
router.route("/verify-email/:token").get(verifyEmail);

// Routes & Controllers Which Need User Authorization & '_id'....
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/resend-email").get(verifyJWT, resendEmailVerification);

export default router;
