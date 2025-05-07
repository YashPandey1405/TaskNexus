import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";

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

import { Router } from "express";

const router = Router();

router.route("/getproject").get(getProjects);
router.route("/getproject/:projectID").get(getProjectById);

// Routes & Controllers Which Need User Authorization & '_id'....
router.route("/create").post(verifyJWT, createProject);

export default router;
