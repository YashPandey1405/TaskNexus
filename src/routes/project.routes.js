import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMemberToProject,
  updateMemberRole,
  deleteMember,
} from "../controllers/project.controllers.js";

// Express-Validator Import.....
import { createProjectValidator } from "../validatores/index.js";

// Middlewares Import.....
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();

router.route("/getproject").get(getProjects);
router.route("/getproject/:projectID").get(getProjectById);

router
  .route("/project-member/change/:projectMemberID")
  .put(verifyJWT, updateMemberRole)
  .delete(verifyJWT, deleteMember);

router
  .route("/project-member/:projectID")
  .get(getProjectMembers)
  .post(addMemberToProject);

// Routes & Controllers Which Need User Authorization & '_id'....
router
  .route("/")
  .post(verifyJWT, createProjectValidator(), validate, createProject);

// Update & delete Project Route & Controller.....
router
  .route("/:projectID")
  .put(verifyJWT, updateProject)
  .delete(verifyJWT, deleteProject);

export default router;
