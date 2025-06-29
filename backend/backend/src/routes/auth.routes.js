import {
  registerUser,
  tempCheckRoute,
  loginUser,
  verifyEmail,
  logoutUser,
  resendEmailVerification,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  forgotPasswordRequest,
  resetForgottenPassword,
} from "../controllers/auth.controllers.js";

// Express-Validator Import.....
import {
  userForgotPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  userResetForgottenPasswordValidator,
} from "../validatores/index.js";

// Middlewares Import.....
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middlewares.js";

import { Router } from "express";

const router = Router();

// Login & Signup Route Which Needs Validation Before Save....
router.route("/login").post(userLoginValidator(), validate, loginUser);
router
  .route("/register")
  .post(
    upload.single("profileImage"),
    userRegistrationValidator(),
    validate,
    registerUser,
  );

router.route("/resend-token").get(refreshAccessToken);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/get-user/:userID").get(getCurrentUser);

// Forgot Password Request & Change Routes.....
router
  .route("/forgot-password-request")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/forgot-password-change/:token")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword,
  );

// Routes & Controllers Which Need User Authorization & '_id'....
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/resend-email").get(verifyJWT, resendEmailVerification);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
