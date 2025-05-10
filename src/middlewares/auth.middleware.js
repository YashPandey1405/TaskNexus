import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

// Jane Se Pehle Mil Ke Jana.....
export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    const token = req.cookies?.accessToken || bearerToken;

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error during JWT verification:", error);
    throw new ApiError(500, "Internal Server Error");
  }
};

// Jane Se Pehle Mil Ke Jana.....
// Middleware To Ensure That Only Project Members Can Create Notes For That Project Only....
export const validateProjectPermission =
  (roles = []) =>
  async (req, res, next) => {
    // Get The Project Id From The Params.....
    const projectID = req.params.projectID;
    console.log("projectID: ", projectID);

    // Check Condition....
    if (!projectID) {
      throw new ApiError(401, "Invalid Project ID");
    }
    try {
      // Get The Current User Role In This Project From ProjectMember Collection...
      const currentProjectMember = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(projectID),
      });

      // Check Condition....
      if (!currentProjectMember) {
        throw new ApiError(404, "Project Member Not Found");
      }

      // Role Of The Current User In This Project....
      const currentMemberRole = currentProjectMember.role;

      // Check Condition....
      if (!roles.includes(currentMemberRole)) {
        throw new ApiError(
          403,
          "You Don't Have Permission To Perform The Action",
        );
      }

      // Makes user.role=currentMemberRole , This Will Be Accessible In req.....
      req.user.role = currentMemberRole;
      next();
    } catch (error) {
      console.error("Error during Project Permission Middleware:", error);
      throw new ApiError(500, "Internal Server Error");
    }
  };

// Jane Se Pehle Mil Ke Jana.....
// Middleware To Ensure That Only Project Members Can Perform Create,Update & Delete Of ProjectMember....
export const validateProjectMemberPermission =
  (roles = []) =>
  async (req, res, next) => {
    // Get The Project Id From The Params.....
    const projectMemberID = req.params.projectMemberID;
    console.log("projectMemberID: ", projectMemberID);

    // Check Condition....
    if (!projectMemberID) {
      throw new ApiError(401, "Invalid projectMember ID");
    }

    // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
    const LoggedInuserID = req.user._id;
    console.log("LoggedInuserID: ", LoggedInuserID);
    try {
      const requestedProjectMember =
        await ProjectMember.findById(projectMemberID);

      if (!requestedProjectMember) {
        throw new ApiError(404, "Project Member Not Found");
      }

      // To Check Whether The Current User Is Involved In That Project....
      const currentProjectMember = await ProjectMember.findOne({
        user: LoggedInuserID,
        project: requestedProjectMember.project,
      });

      if (!currentProjectMember) {
        throw new ApiError(403, "You Are Not Authorized To Peform This Task");
      }

      // Role Of The Current User In This Project....
      const currentMemberRole = currentProjectMember.role;

      // Check Condition....
      if (!roles.includes(currentMemberRole)) {
        throw new ApiError(
          403,
          "You Don't Have Permission To Perform The Action",
        );
      }

      req.projectMemberRole = currentMemberRole;
      next();
    } catch (error) {
      console.error("Error during Project Permission Middleware:", error);
      throw new ApiError(500, "Internal Server Error");
    }
  };

// Jane Se Pehle Mil Ke Jana.....
// Middleware To Ensure That Only Project Members Can Perform Create,Update & Delete Of Task....
export const validateTaskPermission = async (req, res, next) => {
  // Get The task Id From The Params.....
  const taskID = req.params.taskID;
  console.log("taskID: ", taskID);

  // Check Condition....
  if (!taskID) {
    throw new ApiError(401, "Invalid task ID");
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const LoggedInuserID = req.user._id;
  console.log("LoggedInuserID: ", LoggedInuserID);
  try {
    const currentTask = await Task.findById(taskID);

    if (!currentTask) {
      throw new ApiError(404, "task Not Found");
    }

    // Check Condition....
    // Only assignedBy User Of Task Can Update/Delete The Task....
    if (String(currentTask.assignedBy) !== String(LoggedInuserID)) {
      throw new ApiError(
        403,
        "You Don't Have Permission To Perform The Action",
      );
    }

    next();
  } catch (error) {
    console.error("Error during Task Permission Middleware:", error);
    throw new ApiError(500, "Internal Server Error");
  }
};

// Jane Se Pehle Mil Ke Jana.....
// Middleware To Ensure That Only AssignedTo || AssignedBy User Of An Task Can Create SubTask....
export const validateSubTaskPermission = async (req, res, next) => {
  // Get The task Id From The Params.....
  const subtaskID = req.params.subtaskID;
  console.log("subtaskID: ", subtaskID);

  // Check Condition....
  if (!subtaskID) {
    throw new ApiError(401, "Invalid task ID");
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const LoggedInuserID = req.user._id;
  console.log("LoggedInuserID: ", LoggedInuserID);
  try {
    const currentSubTask = await SubTask.findById(subtaskID);

    if (!currentSubTask) {
      throw new ApiError(404, "SubTask Not Found");
    }

    const relatedTaskForCurrentSubTask = await Task.findById(
      currentSubTask.task,
    );

    if (!relatedTaskForCurrentSubTask) {
      throw new ApiError(400, "Task not Found");
    }

    // Check Condition....
    // Only assignedBy User Of Task Can Update/Delete The SubTask....
    if (
      String(relatedTaskForCurrentSubTask.assignedBy) !== String(LoggedInuserID)
    ) {
      throw new ApiError(
        403,
        "You Don't Have Permission To Perform The Action",
      );
    }

    next();
  } catch (error) {
    console.error("Error during SubTask Permission Middleware:", error);
    throw new ApiError(500, "Internal Server Error");
  }
};
