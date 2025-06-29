import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectNote } from "../models/note.models.js";
import { Task } from "../models/task.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

const getNotes = asyncHandler(async (req, res) => {
  // Get The Project Id From The Params.....
  const projectID = req.params.projectID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;
  const currentUserRole = req.user.role;

  try {
    const currentProject = await Project.findById(projectID).populate(
      "createdBy",
      "username",
    );

    // Check Condition....
    if (!currentProject) {
      throw new ApiError(404, "Project Not Found");
    }

    // All Notes Associated With That Project Along With User's Details
    const allProjectNotes = await ProjectNote.find({
      project: new mongoose.Types.ObjectId(currentProject._id),
    })
      .populate("createdBy", "username fullname avatar")
      .sort({ createdAt: 1 }) // 1 = ascending (earliest first)
      .lean();

    // Method to get The Role Of The Note Creator In The Project.......
    await Promise.all(
      allProjectNotes.map(async (projectNote) => {
        const projectID = projectNote.project;
        const createdBy = projectNote.createdBy._id;

        const roleDoc = await ProjectMember.findOne({
          project: projectID,
          user: createdBy,
        }).select("role");

        projectNote.role = roleDoc?.role ?? null;
      }),
    );

    // Check Condition....
    if (allProjectNotes.length === 0) {
      throw new ApiError(404, "No Notes Found For This Project");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      { allProjectNotes, currentUserRole, currentProject },
      "All Assigned Notes To currectProject Returned From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getNotes Controller",
      },
    ]);
  }
});

const getNoteById = asyncHandler(async (req, res) => {
  // Get The Note Id From The Params.....
  const noteID = req.params.noteID;

  if (!noteID) {
    throw new ApiError(400, "noteID Is required");
  }
  try {
    // Notes Associated With That Id Along With User's Details
    const ProjectNoteRequested = await ProjectNote.findById(noteID).populate(
      "createdBy",
      "username fullname avatar",
    );

    // Check Condition....
    if (!ProjectNoteRequested) {
      throw new ApiError(404, "Note Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      ProjectNoteRequested,
      "Requested Notes Returned From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getNoteById Controller",
      },
    ]);
  }
});

const createNote = asyncHandler(async (req, res) => {
  // Get The Project Id From The Params.....
  const projectID = req.params.projectID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content Field Is Required");
  }
  try {
    const currentProject = await Project.findById(projectID);

    // Check Condition....
    if (!currentProject) {
      throw new ApiError(404, "Project Not Found");
    }

    // Create Notes Associated With That Project & currentUser.....
    const newProjectNotes = await ProjectNote.create({
      project: new mongoose.Types.ObjectId(currentProject._id),
      createdBy: new mongoose.Types.ObjectId(userID),
      content: content,
    });

    // Check Condition....
    if (!newProjectNotes) {
      throw new ApiError(404, "No Notes Created For This Project");
    }

    // Notes Associated With That Id Along With User's Details
    const returnProjectNote = await ProjectNote.findById(
      newProjectNotes._id,
    ).populate("createdBy", "username fullname avatar");

    // Check Condition....
    if (!returnProjectNote) {
      throw new ApiError(404, "Note Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      201,
      returnProjectNote,
      "New Note Created Sucsessfully On TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The createNote Controller",
      },
    ]);
  }
});

const updateNote = asyncHandler(async (req, res) => {
  // Get The Note Id From The Params.....
  const noteID = req.params.noteID;

  if (!noteID) {
    throw new ApiError(400, "noteID Is required");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content Field Is Required");
  }
  try {
    const updatedNote = await ProjectNote.findByIdAndUpdate(
      noteID,
      { content }, // Update content
      { new: true }, // Return the updated document
    ).populate("createdBy", "username fullname avatar");

    if (!updatedNote) {
      throw new ApiError(404, "Note Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      updatedNote,
      "Requested Note Updated Successfully From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The updateNote Controller",
      },
    ]);
  }
});

const deleteNote = asyncHandler(async (req, res) => {
  // Get The Note Id From The Params.....
  const noteID = req.params.noteID;

  if (!noteID) {
    throw new ApiError(400, "noteID Is required");
  }

  try {
    const deletedNote = await ProjectNote.findByIdAndDelete(noteID).populate(
      "createdBy",
      "username fullname avatar",
    );

    if (!deletedNote) {
      throw new ApiError(404, "Note Not Found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      deletedNote,
      "Requested Note Deleted Successfully From TaskNexus platform",
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

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
