import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Project } from "../models/project.models.js";

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
    console.log(newProject);

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

const updateProject = asyncHandler(async (req, res) => {});

const deleteProject = asyncHandler(async (req, res) => {});

const getProjectMembers = asyncHandler(async (req, res) => {});

const addMemberToProject = asyncHandler(async (req, res) => {});

const deleteMember = asyncHandler(async (req, res) => {});

const updateMemberRole = asyncHandler(async (req, res) => {});

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
