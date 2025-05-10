import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

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
