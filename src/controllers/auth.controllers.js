import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";

// Importing the mailgen content and sendEmail function from utils/mail.js.....
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";

// Common Method To Generate Access And Refresh Tokens....
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the database for the user.....
    user.refreshToken = refreshToken;

    // Save The Refresh Token Without Validating The User Model....
    // This is useful when you want to update a field without triggering validation rules.
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res
      .status(500)
      .send("Something went wrong while generating referesh and access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get data from request body
  const { email, username, fullname, password } = req.body;
  console.log(req.body);

  //validation
  const errors = [];
  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!username)
    errors.push({ field: "username", message: "Username is required" });
  if (!fullname)
    errors.push({ field: "fullname", message: "Fullname is required" });
  if (!password)
    errors.push({ field: "password", message: "Password is required" });
  // if (!role) errors.push({ field: "role", message: "Role is required" });

  if (errors.length > 0) {
    throw new ApiError(400, "All fields are required", errors);
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // If user already exists, throw an error.....
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(400, "Email already exists", [
          { field: "email", message: "Email already exists" },
        ]);
      } else if (existingUser.username === username) {
        throw new ApiError(400, "Username already exists", [
          { field: "username", message: "Username already exists" },
        ]);
      }
    }

    console.log("Creating new user...");
    // Creates a new User document & Saves it to your MongoDB database.
    // await newUser.save(); --> No need as it's already saved in the create method
    const newUser = await User.create({
      email: email,
      username: username,
      fullname: fullname,
      password: password,
    });
    console.log(newUser);

    // If the user is not created, throw an error.....
    if (!newUser) {
      throw new ApiError(400, "User not created", [
        { field: "user", message: "User not created" },
      ]);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      newUser._id,
    );

    // Get Above Created user info without password & refreshToken
    const loggedInUser = await User.findById(newUser._id).select(
      "-password -refreshToken",
    );

    // Send verification email to the user.....
    const { hashedToken, unHashedToken, tokenExpiry } =
      loggedInUser.generateTemporaryToken();

    loggedInUser.emailVerificationToken = hashedToken; // Save the hashed token to the user document
    loggedInUser.emailVerificationExpiry = tokenExpiry; // Save the token expiry to the user document
    await loggedInUser.save({ validateBeforeSave: false }); // Save the user document without validation

    // Create a verification URL with the Email-Verification token...
    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${unHashedToken}`;
    console.log("Verification URL: ", verificationUrl);

    const EmailVerification_MailgenContent = emailVerificationMailgenContent(
      loggedInUser.username,
      verificationUrl,
    );
    console.log("Mailgen Content Created : ", EmailVerification_MailgenContent);

    // Send the email To The User.....
    await sendEmail({
      email: loggedInUser.email, // receiver's email
      subject: "Please Verify your email address", // subject line
      mailgenContent: EmailVerification_MailgenContent, // Mailgen formatted content
    });
    console.log("Email sent successfully");

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      loggedInUser,
      "Signup successful On TaskNexus Platform",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    return new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The registerUser Controller",
      },
    ]);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const logoutUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
