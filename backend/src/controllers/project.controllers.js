import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";

const getProjects = asyncHandler(async (req, res) => {
  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;

  try {
    const allProjectsAssociatedWithUser = await ProjectMember.find({
      // Filter ProjectMember documents where the user matches the given userID
      user: new mongoose.Types.ObjectId(userID),
    })
      .populate({
        // Populate the 'project' field in ProjectMember with selected fields
        path: "project",
        select: "name description createdBy", // Only include these fields from the Project model

        // Nested populate to get the details of 'createdBy' inside the 'project'
        populate: {
          path: "createdBy", // This refers to the user who created the project
          select: "username", // Only fetch the username of the creator
        },
      })
      .lean(); // makes ProjectMember itself a plain JS object

    // Method to count total users and tasks in each project.......
    await Promise.all(
      allProjectsAssociatedWithUser.map(async (projectMember) => {
        const projectID = projectMember.project._id;

        const [totalUsersInProject, totalTasksInProject] = await Promise.all([
          ProjectMember.countDocuments({ project: projectID }),
          Task.countDocuments({ project: projectID }),
        ]);

        projectMember.project.totalUsersInProject = totalUsersInProject;
        projectMember.project.totalTasksInProject = totalTasksInProject;
      }),
    );

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      allProjectsAssociatedWithUser,
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

    // Similar Work With Notes Model As Well.....
    await ProjectNote.deleteMany({ project: currentProject._id });

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

  try {
    const currentProject = await Project.findById(projectID).populate(
      "createdBy",
      "username email",
    );

    // When No Project Is Been Found.....
    if (!currentProject) {
      throw new ApiError(404, "No project  found");
    }

    const currentProjectMembers = await ProjectMember.find({
      project: projectID,
    }).populate("user", "username fullname avatar");

    // When No Enteries Found From The Database....
    if (currentProjectMembers.length === 0) {
      throw new ApiError(404, "No project members found");
    }

    const [totalTasks, totalNotes] = await Promise.all([
      Task.countDocuments({ project: projectID }),
      ProjectNote.countDocuments({ project: projectID }),
    ]);

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        currentProject,
        currentProjectMembers,
        totalTasks,
        totalNotes,
      },
      "All Project-Members successfully Shared From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjectMembers Controller",
      },
    ]);
  }
});

const getAvailableMembers = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;

  try {
    const allCurrentProjectMembers = await ProjectMember.find({
      project: projectID,
    }).populate("user", "username");

    if (allCurrentProjectMembers.length === 0) {
      throw new ApiError(404, "No project members found");
    }

    const allUsersInDatabase = await User.find().select("_id username email");

    if (allUsersInDatabase.length === 0) {
      throw new ApiError(404, "No users found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        allCurrentProjectMembers,
        allUsersInDatabase,
      },
      "All Project-Members & DB Users successfully Shared From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjectMembers Controller",
      },
    ]);
  }
});

const getProjectMemberByID = asyncHandler(async (req, res) => {
  const projectMemberID = req.params.projectMemberID;

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const userID = req.user._id;

  try {
    const requestedProjectMember = await ProjectMember.findById(
      projectMemberID,
    ).populate("user", "username email");

    // When No Project Member Is Been Found.....
    if (!requestedProjectMember) {
      throw new ApiError(404, "No project  found");
    }

    const currentLoggedInUserRole = await ProjectMember.findOne({
      user: userID,
      project: requestedProjectMember.project,
    }).populate("user", "username fullname avatar");

    // When No Enteries Found From The Database....
    if (!currentLoggedInUserRole) {
      throw new ApiError(404, "No project members found");
    }

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      {
        requestedProjectMember,
        currentLoggedInUserRole,
      },
      "Requested Project-Members successfully Shared From TaskNexus platform",
    );

    // Send All Projects To The Frontend....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getProjectMembers Controller",
      },
    ]);
  }
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const projectID = req.params.projectID;

  const { userID, role } = req.body;

  if (!userID) {
    throw new ApiError(400, "The userID Field Is Required");
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const LoggedInuserID = req.user._id;
  const LoggedInuserRole = req.user.role;

  // Any Member Can't Add Any Project Member.....
  // There Can Be Only 1 Project Admin And More Than 2 Isn't Allowed
  if (LoggedInuserRole === "member" || role === "project_admin") {
    throw new ApiError(
      401,
      "You Are Not Authorized For Project Member Creation",
    );
  }

  // Admin Can't Make Any New Admin In The Project , Only Project Admin Are Authorized To Do This Task.....
  if (LoggedInuserRole === "admin" && role === "admin") {
    throw new ApiError(
      401,
      "You Are Not Authorized For Project Member Creation",
    );
  }

  try {
    const memberUser = await User.findById(userID);
    const currentProject = await Project.findById(projectID);

    // If User OR Project Not Found In The Database....
    if (!memberUser || !currentProject) {
      throw new ApiError(404, "Object Not Found In The Database");
    }

    // To ensure the user isn’t already part of the project.....
    const IsExistingMemberPresent = await ProjectMember.findOne({
      project: currentProject._id,
      user: memberUser._id,
    });

    // When The Requested User Is Already part Of That Project....
    if (IsExistingMemberPresent) {
      throw new ApiError(400, "User is already a member of this project");
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
        message: "Internal server error In The createProjectMember Controller",
      },
    ]);
  }
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const projectMemberID = req.params.projectMemberID;

  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, "The role Field Is Required");
  }

  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
  const LoggedInuserID = req.user._id;
  const LoggedInuserRole = req.projectMemberRole;
  try {
    const requestedProjectMember =
      await ProjectMember.findById(projectMemberID);

    // If requestedProjectMember Not Found In The Database....
    if (!requestedProjectMember) {
      throw new ApiError(404, "ProjectMember Object Not Found In The Database");
    }

    // If The Requested New Role & Old Role Were Same.....
    if (requestedProjectMember.role === role) {
      throw new ApiError(400, "User already has the same role");
    }

    // One More Securtity Check Point.....
    // If New Project Member Role is "project_admin", Then Only "project_admin" Can Update New "project_admin".....
    if (role == "project_admin" && LoggedInuserRole != "project_admin") {
      throw new ApiError(
        403,
        "You Don't Have Permission To Perform The Action",
      );
    }

    // findByIdAndUpdate The Role Of Project Member In The Database...
    const currentProjectMember = await ProjectMember.findByIdAndUpdate(
      projectMemberID,
      { role: role },
      { new: true }, // returns the updated document
    ).populate("user", "username fullname avatar");

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
        message: "Internal server error In The updateProjectMember Controller",
      },
    ]);
  }
});

const deleteMember = asyncHandler(async (req, res) => {
  const projectMemberID = req.params.projectMemberID;

  try {
    // findByIdAndUpdate The Role Of Project Member In The Database...
    const currentProjectMember =
      await ProjectMember.findByIdAndDelete(projectMemberID);

    // If currentProjectMember Not Found In The Database....
    if (!currentProjectMember) {
      throw new ApiError(404, "ProjectMember Object Not Found In The Database");
    }

    // Major Step To Perform Cascade Delete In MongoDB Schema....
    // Manually delete all Tasks & SubTasks Associates to this current Deleted Member.....

    // Step 1: Find all tasks Associated to the current Deleted Member.....
    const tasksToDelete = await Task.find({
      $or: [
        { assignedBy: currentProjectMember.user },
        { assignedTo: currentProjectMember.user },
      ],
    });

    // Step 2: Delete the tasks
    await Task.deleteMany({
      $or: [
        { assignedBy: currentProjectMember.user },
        { assignedTo: currentProjectMember.user },
      ],
    });

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

    // Delete The Notes Associated With The Current Deleted Member.....
    await ProjectNote.deleteMany({ createdBy: currentProjectMember.user });

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
  getProjectMemberByID,
  getProjects,
  updateMemberRole,
  updateProject,
  getAvailableMembers,
};
