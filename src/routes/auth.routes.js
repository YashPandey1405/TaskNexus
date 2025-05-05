import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegistrationValidator } from "../validatores/index.js";

import { Router } from "express";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

export default router;
