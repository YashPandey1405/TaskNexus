import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controllers.js";

// Middlewares Import.....
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import { UserRolesEnum } from "../utils/constants.js";
import { Router } from "express";

const router = Router();

router
  .route("/:projectID/n/:noteID")
  .get(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    getNoteById,
  )
  .put(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.ADMIN,
    ]),
    updateNote,
  )
  .delete(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.ADMIN,
    ]),
    deleteNote,
  );

router
  .route("/:projectID")
  .get(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.MEMBER,
    ]),
    getNotes,
  )
  .post(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createNote,
  );

export default router;
