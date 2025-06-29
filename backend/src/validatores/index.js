import { body } from "express-validator";
import {
  AvailableUserRoles,
  AvailableTaskStatuses,
} from "../utils/constants.js";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3 })
      .withMessage("username should be at least 3 char")
      .isLength({ max: 13 })
      .withMessage("username cannot exceed 13 char"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgottenPasswordValidator = () => {
  return [body("password").notEmpty().withMessage("Password is required")];
};

const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").optional(),
  ];
};

const addMemberToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Role is invalid"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional(),
    body("assignedTo").notEmpty().withMessage("Assigned to is required"),
    body("status")
      .optional()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(AvailableTaskStatuses),
  ];
};

const updateTaskValidator = () => {
  return [
    body("title").optional(),
    body("description").optional(),
    body("status")
      .optional()
      .isIn(AvailableTaskStatuses)
      .withMessage("Status is invalid"),
    body("assignedTo").optional(),
  ];
};

const notesValidator = () => {
  return [body("content").notEmpty().withMessage("Content is required")];
};

export {
  addMemberToProjectValidator,
  createProjectValidator,
  createTaskValidator,
  notesValidator,
  updateTaskValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  userResetForgottenPasswordValidator,
};
