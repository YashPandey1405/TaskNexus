import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";

const getTasks = asyncHandler(async (req, res) => {
  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    // Search Tasks Assgined To The Current Logged In user...
    const currentUserTasks = await Task.find({
      assignedTo: userID,
    }).populate("project", "name description");

    // When No Task Are Found From The Database....
    if (!currentUserTasks) {
      throw new ApiError(404, "Tasks Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentUserTasks,
      "All Assigned Tasks To currectUser Returned From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getTasks Controller",
      },
    ]);
  }
});

const getTaskById = asyncHandler(async (req, res) => {
  const taskID = req.params.taskID;
  console.log("taskID: ", taskID);
  try {
    const currentUserTask = await Task.findById(taskID).populate(
      "project",
      "name description",
    );

    // When No Task Are Found From The Database....
    if (!currentUserTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentUserTask,
      "Requested Task Sucsessfully Returned From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getTaskById Controller",
      },
    ]);
  }
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status, attachments } = req.body;
  console.log(req.body);

  // Extra validation when required fields are missing
  if (!title || !description) {
    throw new ApiError(400, "Task title and description are required", [
      {
        field: !title ? "title" : "description",
        message: "This field is required",
      },
    ]);
  }

  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    // Check Whether Assigned To User Exixts Or Not....
    const assignedToUser = await User.findById(assignedTo).select(
      "-password -refreshToken",
    );

    // If The Assigned To User Doesn't Exists.....
    if (!assignedToUser) {
      throw new ApiError(404, "Assigned To User Doesn't Exists");
    }

    // If The Assigned To User & AssignedBy User Are Same.....
    if (assignedToUser._id == userID) {
      throw new ApiError(
        400,
        "The assigned user and the user assigning the task must be different.",
      );
    }

    // Check Whether The Project Exixts Or Not....
    const currectProject = await Project.findById(projectID);

    // If The Project Doesn't Exists.....
    if (!currectProject) {
      throw new ApiError(404, "Project Doesn't Exists");
    }

    const newTask = await Task.create({
      title: title,
      description: description,
      project: new mongoose.Types.ObjectId(currectProject._id),
      assignedTo: new mongoose.Types.ObjectId(assignedToUser._id),
      assignedBy: new mongoose.Types.ObjectId(userID),
      status: status || "todo", // optional, defaults to "TODO"
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    // When No Task Are Created on The Database....
    if (!newTask) {
      throw new ApiError(400, "Task Not Created");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      newTask,
      "New Task Sucsessfully Created On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createTask Controller",
      },
    ]);
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, attachments } = req.body;
  console.log(req.body);

  const taskID = req.params.taskID;
  console.log("taskID: ", taskID);

  // Validate required fields
  if (!title || !description) {
    throw new ApiError(
      400,
      "title, description must be provided for updating the task.",
    );
  }
  try {
    // Find the task by ID and update it
    const updatedTask = await Task.findByIdAndUpdate(
      taskID,
      {
        title: title,
        description: description,
        status: status || "todo",
        attachments: Array.isArray(attachments) ? attachments : [],
      },
      { new: true }, // To return the updated document
    ).populate("project", "name description");

    // When No Task Are Found From The Database....
    if (!updatedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      updatedTask,
      "Requested Task Sucsessfully Updated On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjects Controller",
      },
    ]);
  }
});

const deleteTask = asyncHandler(async (req, res) => {
  const taskID = req.params.taskID;
  console.log("taskID: ", taskID);
  try {
    // Find the task by ID and update it
    const deletedTask = await Task.findByIdAndDelete(taskID);

    // When No Task Are Found From The Database....
    if (!deletedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      deletedTask,
      "Requested Task Sucsessfully Deleted From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjects Controller",
      },
    ]);
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjects Controller",
      },
    ]);
  }
});

const updateSubTask = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjects Controller",
      },
    ]);
  }
});

const deleteSubTask = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjects Controller",
      },
    ]);
  }
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
