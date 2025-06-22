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
import {
  verifyJWT,
  validateProjectPermission,
  validateProjectMemberPermission,
} from "../middlewares/auth.middleware.js";

import { UserRolesEnum } from "../utils/constants.js";

import { Router } from "express";

const router = Router();

router.route("/getproject").get(getProjects);
router.route("/getproject/:projectID").get(verifyJWT, getProjectById);

// ["admin", "project_admin"] Are Allowed To Update An ProjectMember Role.....
// Only ["project_admin"] Are Allowed To Delete An ProjectMember.....
router
  .route("/project-member/change/:projectMemberID")
  .put(
    verifyJWT,
    validateProjectMemberPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    updateMemberRole,
  )
  .delete(
    verifyJWT,
    validateProjectMemberPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteMember,
  );

// ["admin", "project_admin"] Are Allowed To Create An ProjectMember.....
router
  .route("/project-member/:projectID")
  .get(verifyJWT, getProjectMembers)
  .post(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    addMemberToProject,
  );

// Routes & Controllers Which Need User Authorization & '_id'....
router
  .route("/")
  .post(verifyJWT, createProjectValidator(), validate, createProject);

// Update & delete Project Route & Controller.....
// ["admin", "project_admin"] Are Allowed To Update An Project.....
// Only ["project_admin"] Are Allowed To Delete An Project.....
router
  .route("/:projectID")
  .put(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    updateProject,
  )
  .delete(
    verifyJWT,
    validateProjectPermission([UserRolesEnum.PROJECT_ADMIN]),
    deleteProject,
  );

export default router;
