import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";

const getProjects = asyncHandler(async (req, res) => {
  try {
    const allProjects = await Project.find({}).populate(
      "createdBy",
      "avatar username fullname email",
    );

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      allProjects,
      "All Projects Registered On TaskNexus Platform",
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

const getProjectById = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  try {
    const currentProject = await Project.findById(projectID).populate(
      "createdBy",
      "avatar username fullname email",
    );

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProject,
      "Project request successfully sent from TaskNexus platform",
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

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  console.log(req.body);

  // Extra validation When The Required Fields Are Missing....
  if (!name || !description) {
    throw new ApiError(400, "Project name and description are required", [
      {
        field: !name ? "name" : "description",
        message: "This field is required",
      },
    ]);
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  console.log("userID: ", userID);

  try {
    // To ensure it's a proper ObjectId type, not just a string.....
    // userid: new mongoose.Types.ObjectId(userID)
    const newProject = await Project.create({
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(userID),
    });

    // If The Creation Of The Project Fails....
    if (!newProject) {
      throw new ApiError(400, "Project Creation Failed");
    }

    const newProjectMember = await ProjectMember.create({
      project: new mongoose.Types.ObjectId(newProject._id),
      user: new mongoose.Types.ObjectId(userID),
      role: "project_admin",
    });
    console.log("Project: ", newProject);
    console.log("newProjectMember: ", newProjectMember);

    const currentProject = await Project.findById(newProject._id).populate(
      "createdBy",
      "avatar username fullname email",
    );

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProject,
      "New Project Created successfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  const { name, description } = req.body;
  console.log(req.body);

  // Extra validation When The Required Fields Are Missing....
  if (!name || !description) {
    throw new ApiError(400, "Project name and description are required", [
      {
        field: !name ? "name" : "description",
        message: "This field is required",
      },
    ]);
  }

  try {
    const currentProject = await Project.findByIdAndUpdate(
      projectID,
      {
        name: name,
        description: description,
      },
      { new: true }, // Optional: returns the updated document
    ).populate("createdBy", "avatar username fullname email");

    // When No Project With Provided projectID Exists....
    if (!currentProject) {
      throw new ApiError(404, "User Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProject,
      "Project Updated successfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  try {
    const currentProject = await Project.findByIdAndDelete(projectID);

    // When No Project With Provided projectID Exists....
    if (!currentProject) {
      throw new ApiError(404, "Project Not Found");
    }

    // Major Step To Perform Cascade Delete In MongoDB Schema....
    // Manually delete all Tasks & SubTasks linked to this Project....

    // Step 1: Find all tasks linked to the current project
    const tasksToDelete = await Task.find({ project: currentProject._id });

    // Step 2: Delete the tasks
    await Task.deleteMany({ project: currentProject._id });

    // Step 3: Use the IDs of the deleted tasks to delete corresponding subtasks
    if (tasksToDelete.length > 0) {
      const taskIds = tasksToDelete.map((task) => task._id); // Extract task IDs

      // Cascade delete subtasks linked to these tasks
      await SubTask.deleteMany({
        task: { $in: taskIds }, // Delete all subtasks linked to the tasks
      });

      // Log the deletion of subtasks for debugging purposes
      console.log(`Deleted all subtasks linked to tasks: ${taskIds}`);
    }

    // Similar Work With ProjectMember Model As Well.....
    await ProjectMember.deleteMany({ project: currentProject._id });

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProject,
      "Project Deleted successfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  try {
    const currentProjectMembers = await ProjectMember.find({
      project: projectID,
    });

    // When No Enteries Found From The Database....
    if (!currentProjectMembers) {
      throw new ApiError(404, "Users Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProjectMembers,
      "All Project-Members successfully Shared From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;
  console.log("projectID: ", projectID);

  const { userID, role } = req.body;
  console.log("userID: ", userID);

  if (!userID) {
    throw new ApiError(400, "The userID Field Is Required");
  }
  try {
    const memberUser = await User.findById(userID);
    const currentProject = await Project.findById(projectID);

    // If User OR Project Not Found In The Database....
    if (!memberUser || !currentProject) {
      throw new ApiError(404, "Object Not Found In The Database");
    }

    const newProjectMember = await ProjectMember.create({
      project: new mongoose.Types.ObjectId(currentProject._id),
      user: new mongoose.Types.ObjectId(memberUser._id),
      role: role ?? "member", // if role is undefined or null → "member"
    });

    if (!newProjectMember) {
      throw new ApiError(500, "User Not Saved In The Project");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      newProjectMember,
      "Requested User Added In Project On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const projectMemberID = req.params.projectMemberID;
  console.log("projectMemberID: ", projectMemberID);

  const { role } = req.body;
  console.log("role: ", role);

  if (!role) {
    throw new ApiError(400, "The role Field Is Required");
  }
  try {
    // findByIdAndUpdate The Role Of Project Member In The Database...
    const currentProjectMember = await ProjectMember.findByIdAndUpdate(
      projectMemberID,
      { role: role },
      { new: true }, // returns the updated document
    );

    // If currentProjectMember Not Found In The Database....
    if (!currentProjectMember) {
      throw new ApiError(404, "ProjectMember Object Not Found In The Database");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProjectMember,
      "Requested Role Added In ProjectMember On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

const deleteMember = asyncHandler(async (req, res) => {
  const projectMemberID = req.params.projectMemberID;
  console.log("projectMemberID: ", projectMemberID);

  try {
    // findByIdAndUpdate The Role Of Project Member In The Database...
    const currentProjectMember =
      await ProjectMember.findByIdAndDelete(projectMemberID);

    // If currentProjectMember Not Found In The Database....
    if (!currentProjectMember) {
      throw new ApiError(404, "ProjectMember Object Not Found In The Database");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      currentProjectMember,
      "Requested User Deleted In ProjectMember On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createProject Controller",
      },
    ]);
  }
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
