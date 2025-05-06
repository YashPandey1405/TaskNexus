import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

// Jane Se Pehle Mil Ke Jana.....
export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || null;

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
