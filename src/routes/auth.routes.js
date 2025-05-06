import { registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegistrationValidator } from "../validatores/index.js";

import { Router } from "express";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.get("/verify-email/:token", (req, res) => {
  res.status(200).send("Hello World , Your email is verified");
});

export default router;
