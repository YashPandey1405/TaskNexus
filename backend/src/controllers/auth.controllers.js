import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import crypto from "crypto";

// Importing the mailgen content and sendEmail function from utils/mail.js.....
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";

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

// Just To Learn How To Integrate Cloudinary And Multer In TaskNexus Project......
const tempCheckRoute = asyncHandler(async (req, res) => {
  try {
    // get data from request body
    const { email, username, fullname, password } = req.body;

    const localFilePath = req.file?.path;

    let imageUrl = null;

    if (localFilePath) {
      const cloudinaryResult = await uploadOnCloudinary(localFilePath);

      if (!cloudinaryResult) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
      imageUrl = cloudinaryResult.secure_url;
    }

    const newUser = {
      email,
      username,
      fullname,
      imageUrl,
    };

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      newUser,
      "Control Reached successful On TaskNexus Platform",
    );

    return res.json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The registerUser Controller",
      },
    ]);
  }
});

const registerUser = asyncHandler(async (req, res) => {
  // get data from request body
  const { email, username, fullname, password } = req.body;

  //validation Of The Input Fields....
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

  // Get The Local Path Of The Image Uploaded By The Multer.....
  const localFilePath = req.file?.path;

  // If The LocalPath Isn't Got Created , Throw Error....
  if (!localFilePath) {
    throw new ApiError(500, "File Not Got Uploaded On The Server", [
      { field: "Image", message: "File Not Got Uploaded On The Server" },
    ]);
  }

  // Variale Which Will Actually Hold An Cloudinary Public URL.....
  let imageUrl = null;

  // Now , We Will Upload On The Cloudinary Cloud Service.....
  if (localFilePath) {
    const cloudinaryResult = await uploadOnCloudinary(localFilePath);

    if (!cloudinaryResult) {
      return res.status(500).json({ message: "Failed to upload image" });
    }

    imageUrl = cloudinaryResult.secure_url;
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

    // Creates a new User document & Saves it to your MongoDB database.
    // await newUser.save(); --> No need as it's already saved in the create method
    const newUser = await User.create({
      email,
      username,
      fullname,
      password,
      avatar: {
        url: imageUrl,
      },
    });

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

    const EmailVerification_MailgenContent = emailVerificationMailgenContent(
      loggedInUser.username,
      verificationUrl,
    );

    // Send the email To The User.....
    // await sendEmail({
    //   email: loggedInUser.email, // receiver's email
    //   subject: "Please Verify your email address", // subject line
    //   mailgenContent: EmailVerification_MailgenContent, // Mailgen formatted content
    // });
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
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The registerUser Controller",
      },
    ]);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from request body
  const { email, username, password } = req.body;

  //validation
  const errors = [];
  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!username)
    errors.push({ field: "username", message: "Username is required" });
  if (!password)
    errors.push({ field: "password", message: "Password is required" });
  // if (!role) errors.push({ field: "role", message: "Role is required" });

  if (errors.length > 0) {
    throw new ApiError(400, "All fields are required", errors);
  }

  try {
    // Check For The User Existence.....
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // If user doesn't exist, throw an error.....
    if (!existingUser) {
      throw new ApiError(400, "Invalid credential", [
        { field: "credentials", message: "User Does Not Exist" },
      ]);
    }

    // We Have To Use The Object Instance Of The User Model.....
    // 'isPasswordCorrect' is a method defined in the User model that checks
    // if the provided password matches the hashed password stored in the database.
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    // When the password is incorrect....
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid credential", [
        { field: "credentials", message: "Invalid password Entered" },
      ]);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      existingUser._id,
    );

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken ",
    );

    // Only send the verification email if the user is not verified.....
    if (!loggedInUser.isEmailVerified) {
      // Send verification email to the user.....
      const { hashedToken, unHashedToken, tokenExpiry } =
        loggedInUser.generateTemporaryToken();

      loggedInUser.emailVerificationToken = hashedToken; // Save the hashed token to the user document
      loggedInUser.emailVerificationExpiry = tokenExpiry; // Save the token expiry to the user document
      await loggedInUser.save({ validateBeforeSave: false }); // Save the user document without validation

      // Create a verification URL with the Email-Verification token...
      const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${unHashedToken}`;

      const EmailVerification_MailgenContent = emailVerificationMailgenContent(
        loggedInUser.username,
        verificationUrl,
      );

      // Send the email To The User.....
      await sendEmail({
        email: loggedInUser.email, // receiver's email
        subject: "Please Verify your email address", // subject line
        mailgenContent: EmailVerification_MailgenContent, // Mailgen formatted content
      });
      console.log("Email sent successfully");
    }

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      loggedInUser,
      "Login successful On TaskNexus Platform",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The loginUser Controller",
      },
    ]);
  }

  //validation
});

const logoutUser = asyncHandler(async (req, res) => {
  // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...

  // Await the update operation on the User model, finding the user by their ID
  await User.findByIdAndUpdate(
    req.user._id, // The ID of the currently authenticated user (from the request object)

    {
      // Update operation: using $unset to remove the 'refreshToken' field from the document
      $unset: {
        refreshToken: 1, // '1' indicates the field should be removed (MongoDB syntax)
      },
    },

    {
      new: true, // Option to return the updated document (though it's not stored here)
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Set cookies and redirect
  const response = new ApiResponse(
    200,
    "Logout successful On TaskNexus Platform",
  );

  // Set cookies for access and refresh tokens & send response.....
  return res
    .status(response.statusCode)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(response);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;

  try {
    // Hash The Token received To Make The DB-Comparisn....
    const hashedToken = crypto
      .createHash("sha256") // 1️⃣ Create a SHA-256 hash function
      .update(token) // 2️⃣ Pass the unhashed token to be hashed
      .digest("hex"); // 3️⃣ Convert the hash output to a hexadecimal string

    // Find The User Based On The Hashed Verification Token.....
    const existingUser = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    // Special case >>> When The User Is Been Already Verified & After This , If It requests That
    // Verify-email , Then , The emailVerificationToken=null and emailVerificationExpiry=""......
    if (!existingUser) {
      // Optionally, try to find by email if you want to differentiate
      const userMaybeVerified = await User.findOne({
        isEmailVerified: true,
        emailVerificationToken: { $in: [null, "", undefined] },
      });

      if (userMaybeVerified) {
        throw new ApiError(400, "User Already Verified", [
          { field: "email", message: "User email has already been verified" },
        ]);
      }

      // If user doesn't exist, throw an error.....
      throw new ApiError(400, "Invalid token", [
        { field: "token", message: "Invalid or expired token" },
      ]);
    }

    // Check if the token has expired Or Not.....
    if (existingUser.emailVerificationExpiry.getTime() < Date.now()) {
      throw new ApiError(400, "Token expired", [
        { field: "token", message: "Email Verification Token Expired" },
      ]);
    }

    // User is Been Verified , So We Have To Update The User's isEmailVerified Field To True.....
    // Also , Clear The Email Verification Token & Expiry.....
    existingUser.isEmailVerified = true;
    existingUser.emailVerificationToken = "";
    existingUser.emailVerificationExpiry = null;

    await existingUser.save();

    // Set API Response On Sucsessful Email Verification.....
    const response = new ApiResponse(
      200,
      "Email verification Is successful On TaskNexus Platform",
    );

    // Send The Successful Response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The verifyEmail Controller",
      },
    ]);
  }
  //validation
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  try {
    // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
    const currentUser = await User.findById(req.user._id).select(
      "-password -refreshToken",
    );

    // If The User Is Not Found In Database......
    if (!currentUser) {
      throw new ApiError(400, "Invalid User", [
        { field: "User", message: "User Not Found" },
      ]);
    }

    // If The User Is been Already Verified....
    if (currentUser.isEmailVerified) {
      throw new ApiError(400, "User Is Been Already verified");
    }

    // Send verification email to the user.....
    const { hashedToken, unHashedToken, tokenExpiry } =
      currentUser.generateTemporaryToken();

    currentUser.emailVerificationToken = hashedToken; // Save the hashed token to the user document
    currentUser.emailVerificationExpiry = tokenExpiry; // Save the token expiry to the user document
    await currentUser.save({ validateBeforeSave: false }); // Save the user document without validation

    // Create a verification URL with the Email-Verification token...
    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${unHashedToken}`;

    const EmailVerification_MailgenContent = emailVerificationMailgenContent(
      currentUser.username,
      verificationUrl,
    );

    // Send the email To The User.....
    // await sendEmail({btt
    //   email: currentUser.email, // receiver's email
    //   subject: "Please Verify your email address", // subject line
    //   mailgenContent: EmailVerification_MailgenContent, // Mailgen formatted content
    // });
    console.log("Email sent successfully");

    // Set the success mail message to frontend.....
    const response = new ApiResponse(
      200,
      unHashedToken,
      "Mail Send successful To user's Email",
    );

    // send response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message:
          "Internal server error In The resendEmailVerification Controller",
      },
    ]);
  }

  //validation
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password != confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  // Get Token From The URL....
  const token = req.params.token;

  try {
    // Hash The Token received To Make The DB-Comparisn....
    const hashedToken = crypto
      .createHash("sha256") // 1️⃣ Create a SHA-256 hash function
      .update(token) // 2️⃣ Pass the unhashed token to be hashed
      .digest("hex"); // 3️⃣ Convert the hash output to a hexadecimal string

    // Find The User Based On The Hashed Verification Token.....
    const existingUser = await User.findOne({
      forgotPasswordToken: hashedToken,
    }).select("-password -refreshToken");

    // If The User is Not Found In The Database....
    if (!existingUser) {
      throw new ApiError(404, "User Not Found");
    }

    // Check if the token has expired Or Not.....
    if (existingUser.forgotPasswordExpiry.getTime() < Date.now()) {
      throw new ApiError(400, "Token expired", [
        { field: "token", message: "Forgot Password Token Expired" },
      ]);
    }

    // User is Been Verified , So We Have To Update The User's Password Field To New Password.....
    existingUser.password = password;
    existingUser.forgotPasswordToken = "";
    existingUser.forgotPasswordExpiry = null;

    await existingUser.save();

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken ",
    );

    // Set the requested user API response.....
    const response = new ApiResponse(
      200,
      loggedInUser,
      "Successfully Changes user's Password on TaskNexus.",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The refreshAccessToken Controller",
      },
    ]);
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const accessTokenFromCookie = req.cookies?.accessToken || null;

  if (accessTokenFromCookie) {
    // When accessToken already exists, Then No Need To Re-Generate Them....
    throw new ApiError(401, "User Already Logged In To TaskNexux Platform");
  }

  const refreshTokenFromCookie = req.cookies?.refreshToken || null;

  // When refreshToken expired, Then , User Have To Re-Login On TaskNexus....
  if (!refreshTokenFromCookie) {
    throw new ApiError(401, "User Has To Login To TaskNexux Platform");
  }

  try {
    // Find The User Based On The refreshTokenFromCookie Token.....
    const existingUser = await User.findOne({
      refreshToken: refreshTokenFromCookie,
    });

    // When user Is Not Found In The database....
    if (!existingUser) {
      throw new ApiError(401, "User Not Found");
    }

    // existingUser.refreshToken = null;  >> No Need of This Extra Step...

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      existingUser._id,
    );

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken ",
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Set cookies and redirect
    const response = new ApiResponse(
      200,
      loggedInUser,
      "Access & Refresh Token Regenerated On TaskNexus Platform",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The refreshAccessToken Controller",
      },
    ]);
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // When the email is not provided or not in valid format
  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Please provide an email address.");
  }

  try {
    // Find The User Based On The Hashed Verification Token.....
    const existingUser = await User.findOne({
      email: email,
    }).select("-password -refreshToken");

    // When The User Is Not Found In The Database.....
    if (!existingUser) {
      throw new ApiError(404, "User Not Found");
    }

    // Send forgot-password Email to the user.....
    const { hashedToken, unHashedToken, tokenExpiry } =
      existingUser.generateTemporaryToken();

    existingUser.forgotPasswordToken = hashedToken; // Save the hashed token to the user document
    existingUser.forgotPasswordExpiry = tokenExpiry; // Save the token expiry to the user document
    await existingUser.save({ validateBeforeSave: false }); // Save the user document without validation

    // Create a verification URL with the Forgot-Password token...
    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/forgot-password-change/${unHashedToken}`;

    // Mail Template Creation Through Mailgen npm.....
    const ForgotPassword_MailgenContent = forgotPasswordMailgenContent(
      existingUser.username,
      verificationUrl,
    );

    // Send the email To The User.....
    // await sendEmail({
    //   email: existingUser.email, // receiver's email
    //   subject: "Reset Your Password", // subject line
    //   mailgenContent: ForgotPassword_MailgenContent, // Mailgen formatted content
    // });
    console.log("Email sent successfully");

    // Set the success mail message to frontend.....
    const response = new ApiResponse(
      200,
      unHashedToken,
      "Mail Send successfully To user's Email",
    );

    // send response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message:
          "Internal server error In The forgotPasswordRequest Controller",
      },
    ]);
  }

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  try {
    // req.user is Available Due To The VerifyJWT Middleware Used before this Controller...
    const existingUser = await User.findById(req.user._id).select(
      "-password -refreshToken",
    );

    // When user Is Not Found In The database....
    if (!existingUser) {
      throw new ApiError(404, "User Not Found");
    }

    // User is Been Verified , So We Have To Update The User's Password Field To New Password.....
    existingUser.password = password;

    await existingUser.save();

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken ",
    );

    // Set the requested user API response.....
    const response = new ApiResponse(
      200,
      loggedInUser,
      "Successfully Changes user's Password on TaskNexus.",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getCurrentUser Controller",
      },
    ]);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userID = req.params.userID;

  try {
    // Find The User Based On The userID Of User.....
    const existingUser = await User.findById(userID).select(
      "-password -refreshToken ",
    );

    // When user Is Not Found In The database....
    if (!existingUser) {
      throw new ApiError(401, "User Not Found");
    }

    const allAssociatedProject = await ProjectMember.find({
      user: userID,
    })
      .populate("project", "name description")
      .lean();

    // Method to count Total Associated Notes , Tasks & SubTasks Of The Current Requested User.......
    await Promise.all(
      allAssociatedProject.map(async (projectMember) => {
        const projectID = projectMember.project._id;

        // Total Associated Tasks Of That Project With The Requested User
        const totalAssociatedTasks = await Task.find({
          project: projectID,
          $or: [{ assignedBy: userID }, { assignedTo: userID }],
        });

        // Total Associated Sub-Tasks Of That Project With The Requested User
        const allTasksOfCurrentProject = await Task.find({
          project: projectID,
        }).select("_id");

        const allSubTasksCreatedByUser = await SubTask.find({
          createdBy: userID,
        });

        // Step 1: Extract task IDs of the current project into a Set for fast lookup
        const projectTaskIds = new Set(
          allTasksOfCurrentProject.map((task) => task._id.toString()),
        );

        // Step 2: Filter SubTasks where .task is in that set
        const matchedSubTasks = allSubTasksCreatedByUser.filter((subtask) =>
          projectTaskIds.has(subtask.task.toString()),
        );

        // Step 3: Get the total count
        const totalMatchingSubTasksCount = matchedSubTasks.length;

        // Total Associated Notes Of That Project With The Requested User
        const totalAssociatedNotes = await ProjectNote.countDocuments({
          project: projectID,
          createdBy: userID,
        });

        projectMember.totalAssociatedTasks = totalAssociatedTasks.length;
        projectMember.totalAssociatedSubTasks = totalMatchingSubTasksCount;
        projectMember.totalAssociatedNotes = totalAssociatedNotes;
      }),
    );

    // Set the requested user API response.....
    const response = new ApiResponse(
      200,
      { existingUser, allAssociatedProject },
      "Successfully fetched user details on TaskNexus.",
    );

    // Set cookies for access and refresh tokens & send response.....
    return res.status(response.statusCode).json(response);
  } catch (error) {
    // Handle any errors that occur during user creation
    throw new ApiError(500, "Internal server error", [
      {
        field: "server",
        message: "Internal server error In The getCurrentUser Controller",
      },
    ]);
  }
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
  tempCheckRoute,
};
