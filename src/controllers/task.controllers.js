import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

const getTasks = asyncHandler(async (req, res) => {
  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    // Search Tasks Assgined To The Current Logged In user...
    const currentUser_TasksAssignedToUser = await Task.find({
      assignedTo: userID,
    }).populate("project", "name description");

    // Search Tasks Assgined By The Current Logged In user...
    const currentUser_TasksAssignedByUser = await Task.find({
      assignedBy: userID,
    }).populate("project", "name description");

    // When No Task Are Found From The Database....
    if (!currentUser_TasksAssignedToUser || !currentUser_TasksAssignedByUser) {
      throw new ApiError(404, "Tasks Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        AssignedToUser: currentUser_TasksAssignedToUser,
        AssignedByUser: currentUser_TasksAssignedByUser,
      },
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
  const LoggedInuserRole = req.user.role;
  console.log("userID: ", userID);
  console.log("LoggedInuserRole: ", LoggedInuserRole);

  try {
    // Check Whether Assigned To User & Project Exixts Or Not....
    const assignedToUser = await User.findById(assignedTo).select(
      "-password -refreshToken",
    );
    const currentProject = await Project.findById(projectID);

    // If The Assigned To User Doesn't Exists.....
    if (!assignedToUser || !currentProject) {
      throw new ApiError(404, "Assigned user or project not found");
    }

    // An Security Check Point.....
    // Due To The validateProjectPermission middleware , assignedByUser Is ["admin", "project_admin"]....
    // Now , Check Whether The assignedToUser is Part Of The project Or Not....
    const assignedToUserProjectMember = await ProjectMember.findOne({
      user: assignedToUser._id,
      project: currentProject._id,
    });

    if (
      assignedToUserProjectMember.role == "project_admin" &&
      LoggedInuserRole != "project_admin"
    ) {
      throw new ApiError(
        403,
        "You Don't Have Permission To Perform The Action",
      );
    }

    // If The Assigned To User & AssignedBy User Are Same.....
    if (assignedToUser._id == userID) {
      throw new ApiError(
        400,
        "The assigned user and the user assigning the task must be different.",
      );
    }

    const newTask = await Task.create({
      title: title,
      description: description,
      project: new mongoose.Types.ObjectId(currentProject._id),
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

    // Major Step To Perform Cascade Delete In MongoDB Schema....
    // Manually delete all subtasks linked to this task....
    await SubTask.deleteMany({ task: taskID });
    console.log(`Deleted all subtasks linked to taskID: ${taskID}`);

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
  const { title, isCompleted } = req.body;
  console.log(req.body);

  // Extra validation when required fields are missing
  if (!title) {
    throw new ApiError(400, "Task title is required", [
      {
        field: "title",
        message: "This field is required",
      },
    ]);
  }

  const taskID = req.params.taskID;
  console.log("taskID: ", taskID);

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    // Search For The Task In The Database....
    const requestedTask = await Task.findById(taskID);

    // If No Task Found From The Database.....
    if (!requestedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // To Ensure The Current user is Either assignedTo Or assignedBy user In Task.....
    if (
      String(requestedTask.assignedTo) !== String(userID) &&
      String(requestedTask.assignedBy) !== String(userID)
    ) {
      throw new ApiError(
        403,
        "You Are Not Authorized To Create New Sub-Task For This Task",
      );
    }

    // Create An SubTask In The Database......
    const newSubTask = await SubTask.create({
      title: title,
      task: new mongoose.Types.ObjectId(requestedTask._id),
      isCompleted: isCompleted || false,
      createdBy: new mongoose.Types.ObjectId(userID),
    });

    if (!newSubTask) {
      throw new ApiError(500, "Sub-Task Not Created");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      newSubTask,
      "Requested Sub-Task Created Sucsessfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createSubTask Controller",
      },
    ]);
  }
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  console.log(req.body);

  // Extra validation when required fields are missing
  if (!title) {
    throw new ApiError(400, "Task title is required", [
      {
        field: "title",
        message: "This field is required",
      },
    ]);
  }

  const subtaskID = req.params.subtaskID;
  console.log("subtaskID: ", subtaskID);

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      subtaskID,
      { title, isCompleted: isCompleted || false },
      { new: true }, // To return the updated document
    );

    if (!updatedSubTask) {
      throw new ApiError(404, "Sub-Task Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      updatedSubTask,
      "Requested Sub-Task Updated Sucsessfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The updateSubTask Controller",
      },
    ]);
  }
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const subtaskID = req.params.subtaskID;
  console.log("subtaskID: ", subtaskID);

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);
  try {
    // Find the task and ensure it belongs to the user
    const subtaskToDelete = await SubTask.findOne({
      _id: subtaskID,
      createdBy: userID,
    });

    if (!subtaskToDelete) {
      throw new ApiError(404, "SubTask not found or unauthorized access");
    }

    // Now delete the task itself
    const deletedSubTask = await SubTask.findByIdAndDelete(subtaskID);

    if (!deletedSubTask) {
      throw new ApiError(500, "Sub-Task Not Deleted");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      deletedSubTask,
      "Requested Sub-Task Deleted Sucsessfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The deleteSubTask Controller",
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
