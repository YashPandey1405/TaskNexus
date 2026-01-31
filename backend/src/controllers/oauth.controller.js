import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = asyncHandler(async (req, res) => {
  // STEP 1️⃣: Extract Google ID token from request body
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "Google ID token is required");
  }

  //STEP 2️⃣: Verify Google ID Token
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired Google token");
  }

  // STEP 3️⃣: Extract required user info from Google payload
  const {
    email,
    name,
    picture,
    sub: googleId, // unique Google user ID
  } = payload;

  if (!email || !googleId) {
    throw new ApiError(400, "Invalid Google account data");
  }

  // STEP 4️⃣: Check if user already exists
  let user = await User.findOne({
    $or: [{ email }, { googleId }],
  });

  //  STEP 5️⃣: If user exists
  if (user) {
    //  CASE: User signed up earlier with email/password
    if (user.authProvider === "local" && !user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isEmailVerified = true;

      await user.save({ validateBeforeSave: false });
    }
  }

  //  STEP 6️⃣: If user does NOT exist → Create new Google user
  if (!user) {
    user = await User.create({
      email,
      fullname: name,
      username: email.split("@")[0],
      avatar: {
        url: picture,
      },
      googleId,
      authProvider: "google",
      isEmailVerified: true,
    });
  }

  //    STEP 7️⃣: Generate Access & Refresh Tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  //    STEP 8️⃣: Remove sensitive fields from response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, loggedInUser, "Google authentication successful"),
    );
});

export { googleAuthController };
