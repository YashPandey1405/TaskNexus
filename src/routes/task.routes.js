import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controllers.js";

// Express-Validator Import.....
import { createProjectValidator } from "../validatores/index.js";

// Middlewares Import.....
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();

router.route("/get-tasks").get(verifyJWT, getTasks);
router.route("/get-tasks/:taskID").get(verifyJWT, getTaskById);

router.route("/create-task/:projectID").post(verifyJWT, createTask);

// Update & Delete Route To Task.....
router
  .route("/:taskID")
  .put(verifyJWT, updateTask)
  .delete(verifyJWT, deleteTask);

export default router;
