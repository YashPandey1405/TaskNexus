import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNote } from "../models/note.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

const getTasks = asyncHandler(async (req, res) => {
  // Extracting projectID from the request parameters....
  const projectID = req.params.projectID;

  // Validate the projectID format.....
  if (!mongoose.isValidObjectId(projectID)) {
    throw new ApiError(400, "Invalid project ID format");
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // 1. Get tasks assigned in the current project
    const currentProject_TasksAssigned = await Task.find({
      project: projectID,
    })
      .populate("assignedTo", "username email")
      .populate("assignedBy", "username email")
      .lean();

    // When No Task Are Found From The Database....
    if (!currentProject_TasksAssigned) {
      throw new ApiError(404, "Tasks Not Found");
    }

    // 2. Add subtask count to each task
    await Promise.all(
      currentProject_TasksAssigned.map(async (task) => {
        const totalSubTasksInTask = await SubTask.countDocuments({
          task: task._id,
        });
        task.subTask = totalSubTasksInTask;
      }),
    );

    // 3. Get total users in the project
    const totalUsersInTheProject = await ProjectMember.countDocuments({
      project: projectID,
    });
    const totalNotesInTheProject = await ProjectNote.countDocuments({
      project: projectID,
    });

    // 4. Get project admins
    const projectAdmins = await ProjectMember.findOne({
      project: projectID,
      role: "project_admin",
    })
      .populate("user", "username email")
      .populate("project", "name description");

    // 5. Get global admins
    const admins = await ProjectMember.find({
      project: projectID,
      role: "admin",
    }).populate("user", "username email");

    const currentUserInProject = await ProjectMember.findOne({
      user: userID,
      project: projectID,
    }).populate("user", "username email");

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        tasks: currentProject_TasksAssigned,
        projectTotalUsers: totalUsersInTheProject,
        totalNotesInTheProject: totalNotesInTheProject,
        projectCreator: projectAdmins,
        projectAdmins: admins,
        currentUser: currentUserInProject,
      },
      "All Assigned Tasks To Project Returned From TaskNexus platform",
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

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    const currentUserTask = await Task.findById(taskID)
      .populate("project", "name description")
      .populate("assignedBy", "username email")
      .populate("assignedTo", "username email");
    // When No Task Are Found From The Database....
    if (!currentUserTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // To Get The Task Creator Role In The Current Project....
    const assignedByUserRole = await ProjectMember.findOne({
      user: currentUserTask.assignedBy._id,
      project: currentUserTask.project._id,
    }).select("role");

    // To Get The Task Assignee Role In The Current Project....
    const assignedToUserRole = await ProjectMember.findOne({
      user: currentUserTask.assignedTo._id,
      project: currentUserTask.project._id,
    }).select("role");

    const currentLoggedInUserDetails = await ProjectMember.findOne({
      user: userID,
      project: currentUserTask.project,
    });

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        currentUserTask: currentUserTask,
        assignedByUserRole: assignedByUserRole,
        assignedToUserRole: assignedToUserRole,
        currentLoggedInUserDetails: currentLoggedInUserDetails,
      },
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

const getDataForcreateTask = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;

  try {
    // Check Whether Assigned To User & Project Exists Or Not....
    const currentLoggedInUserRole = await ProjectMember.findOne({
      user: userID,
      project: projectID,
    });

    // If The Assigned To User Doesn't Exists.....
    if (!currentLoggedInUserRole) {
      throw new ApiError(404, "Assigned user or project not found");
    }

    // Get All The Project Members Of The Project......
    const allProjectMembers = await ProjectMember.find({
      project: projectID,
    }).populate("user", "username email");

    // If The Current Project Doesn't Exists.....
    if (!allProjectMembers) {
      throw new ApiError(404, "No Project Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        currentUserDetails: currentLoggedInUserRole,
        allProjectMembers: allProjectMembers,
      },
      "All Data Been Shared Sucsessfully Shared from TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message:
          "Internal server error In The Send Data For createTask Controller",
      },
    ]);
  }
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status, attachments } = req.body;

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

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  const LoggedInuserRole = req.user.role;

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

const quickUpdateTask = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const taskID = req.params.taskID;

  try {
    // Find the task by ID and update it
    const updatedTask = await Task.findByIdAndUpdate(
      taskID,
      {
        status: status || "todo",
      },
      { new: true }, // To return the updated document
    );

    // When No Task Are Found From The Database....
    if (!updatedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      undefined,
      "Requested Task Updated On TaskNexus platform",
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

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, attachments } = req.body;

  const taskID = req.params.taskID;

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

const getSubTasks = asyncHandler(async (req, res) => {
  const taskID = req.params.taskID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // Search For The Task In The Database....
    const requestedTask = await Task.findById(taskID)
      .populate("project", "name")
      .populate("assignedTo", "username")
      .populate("assignedBy", "username");
    // If No Task Found From The Database.....

    if (!requestedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    const currentUserRole = await ProjectMember.findOne({
      user: userID,
      project: requestedTask.project._id,
    }).select("role");

    // Create An SubTask In The Database......
    const allAssociatedSubTasks = await SubTask.find({
      task: requestedTask._id,
    }).lean();

    // Method to Show The SubTask Creator UserName & Role In Each SubTask.......
    await Promise.all(
      allAssociatedSubTasks.map(async (subTask) => {
        console.log(subTask);
        const ProjectOfCurrentSubTask = await Task.findById(
          subTask.task,
        ).select("project");

        const currentSubTaskCreatorRole = await ProjectMember.findOne({
          user: subTask.createdBy,
          project: ProjectOfCurrentSubTask.project,
        }).populate("user", "username avatar");

        subTask.currentSubTaskCreatorRole = currentSubTaskCreatorRole;
      }),
    );

    if (!allAssociatedSubTasks) {
      throw new ApiError(500, "Sub-Task Not Created");
    }

    const assignedByUserRole = await ProjectMember.findOne({
      user: requestedTask.assignedBy._id,
      project: requestedTask.project,
    }).select("role");

    const assignedToUserRole = await ProjectMember.findOne({
      user: requestedTask.assignedTo._id,
      project: requestedTask.project,
    }).select("role");

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        requestedTask,
        allAssociatedSubTasks,
        currentUserRole,
        assignedByUserRole,
        assignedToUserRole,
      },
      "Requested Sub-Task Send Sucsessfully From TaskNexus platform",
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

const getSubTaskByID = asyncHandler(async (req, res) => {
  const subTaskID = req.params.subTaskID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // Search For The Task In The Database....
    const requestedSubTask = await SubTask.findById(subTaskID);

    // If No Task Found From The Database.....
    if (!requestedSubTask) {
      throw new ApiError(404, "SubTask Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      requestedSubTask,
      "Requested Sub-Task Send Sucsessfully From TaskNexus platform",
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

const createSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;

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

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // Search For The Task In The Database....
    const requestedTask = await Task.findById(taskID);
    console.log(requestedTask);

    // If No Task Found From The Database.....
    if (!requestedTask) {
      throw new ApiError(404, "Task Not Found");
    }

    // Check In The Database Is The Current User is The Project Admin.....
    const currentUserRole = await ProjectMember.findOne({
      user: userID,
      project: requestedTask.project,
    });

    // If The Current User Isn't Part Of The Project....
    if (!currentUserRole) {
      throw new ApiError(
        403,
        "You Are Not Authorized To Create New Sub-Task For This Task",
      );
    }

    // To Ensure The Current user is Either assignedBy user In Task Or He Is Not An Member.....
    if (
      String(requestedTask.assignedBy) !== String(userID) ||
      currentUserRole.role === "member"
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

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // Find the task and ensure it belongs to the user
    const subtaskToUpdate = await SubTask.findById(subtaskID);

    // If The Task Isn't Found In The Database.....
    if (!subtaskToUpdate) {
      throw new ApiError(404, "Sub-Task Not Found In The Database");
    }

    // If The Current User Isn't Created The Sub-Task......
    // Then Check , Is He Project Admin , Then Update Otherwise 403 Error Message....
    if (String(subtaskToUpdate.createdBy) !== String(userID)) {
      // Check Is The User Is The Project Admin Of The Project.....
      const taskIDOfTheSubTask = subtaskToUpdate.task;
      console.log(taskIDOfTheSubTask);

      const currentParentTask = await Task.findById(taskIDOfTheSubTask);

      // Now Search For The User Role In The Project......
      const currentUser = await ProjectMember.findOne({
        user: userID,
        project: currentParentTask.project,
      });

      if (!currentUser || currentUser.role !== "project_admin") {
        throw new ApiError(403, "unauthorized access To Delete Sub-Task");
      }
    }

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

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  try {
    // Find the task and ensure it belongs to the user
    const subtaskToDelete = await SubTask.findById(subtaskID);

    // If The Task Isn't Found In The Database.....
    if (!subtaskToDelete) {
      throw new ApiError(404, "Sub-Task Not Found In The Database");
    }

    // If The Current User Isn't Created The Sub-Task......
    // Then Check , Is He Project Admin , Then Delete Otherwise 403 Error Message....
    if (String(subtaskToDelete.createdBy) !== String(userID)) {
      // Check Is The User Is The Project Admin Of The Project.....
      const taskIDOfTheSubTask = subtaskToDelete.task;

      const currentParentTask = await Task.findById(taskIDOfTheSubTask);

      // Now Search For The User Role In The Project......
      const currentUser = await ProjectMember.findOne({
        user: userID,
        project: currentParentTask.project,
      });

      if (!currentUser || currentUser.role !== "project_admin") {
        throw new ApiError(403, "unauthorized access To Delete Sub-Task");
      }
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
};
