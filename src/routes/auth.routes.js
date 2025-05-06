import {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  resendEmailVerification,
} from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  userRegistrationValidator,
  userLoginValidator,
} from "../validatores/index.js";

import { Router } from "express";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/verify-email/:token").get(verifyEmail);
router.route("/resend-email").get(verifyJWT, resendEmailVerification);

export default router;
