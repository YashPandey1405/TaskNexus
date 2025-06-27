import {
  getTasks,
  getTaskById,
  getDataForcreateTask,
  createTask,
  quickUpdateTask,
  updateTask,
  deleteTask,
  getSubTasks,
  getSubTaskByID,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controllers.js";

// Express-Validator Import.....
import { createProjectValidator } from "../validatores/index.js";

// Middlewares Import.....
import { validate } from "../middlewares/validator.middlewares.js";
import {
  verifyJWT,
  validateProjectPermission,
  validateProjectMemberPermission,
  validateTaskPermission,
  validateSubTaskPermission,
} from "../middlewares/auth.middleware.js";

import { UserRolesEnum } from "../utils/constants.js";

import { Router } from "express";

const router = Router();

router.route("/get-tasks/project/:projectID").get(verifyJWT, getTasks);
router.route("/get-tasks/:taskID").get(verifyJWT, getTaskById);

// ["admin", "project_admin"] Are Allowed To Create An Task Of An Project.....
router
  .route("/create-task/:projectID")
  .get(verifyJWT, getDataForcreateTask)
  .post(
    verifyJWT,
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createTask,
  );

// Routes For Sub-Task Controllers
router.route("/subtask/get/:taskID").get(verifyJWT, getSubTasks);
router.route("/subtask/getByID/:subTaskID").get(verifyJWT, getSubTaskByID);

// Only Task Creator & Project Admin Can Create An SubTask.....
router.route("/subtask/create/:taskID").post(verifyJWT, createSubTask);

router
  .route("/subtask/:subtaskID")
  .put(verifyJWT, validateSubTaskPermission, updateSubTask)
  .delete(verifyJWT, validateSubTaskPermission, deleteSubTask);

// Update & Delete Route To Task.....
router
  .route("/quick-change/:taskID")
  .put(verifyJWT, validateTaskPermission, quickUpdateTask);

router
  .route("/:taskID")
  .put(verifyJWT, validateTaskPermission, updateTask)
  .delete(verifyJWT, validateTaskPermission, deleteTask);

export default router;
