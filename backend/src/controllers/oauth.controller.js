import axios from "axios";
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

// Google OAuth Controller.....
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

// GitHub OAuth Controller.....
const githubAuthController = asyncHandler(async (req, res) => {
  // Extract GitHub authorization code from request body
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "GitHub authorization code is required");
  }

  console.log("[GitHubAuth] Authorization code received");

  // Exchange authorization code for GitHub access token
  let accessToken;

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: { Accept: "application/json" },
      },
    );

    accessToken = tokenResponse.data.access_token;
  } catch (error) {
    console.error("[GitHubAuth] Token exchange failed", error.message);
    throw new ApiError(401, "Failed to exchange GitHub authorization code");
  }

  if (!accessToken) {
    throw new ApiError(401, "GitHub access token not received");
  }

  console.log("[GitHubAuth] Access token generated");

  // Fetch GitHub user profile
  let githubUser;

  try {
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    githubUser = userResponse.data;
  } catch (error) {
    console.error("[GitHubAuth] Failed to fetch user profile", error.message);
    throw new ApiError(401, "Unable to fetch GitHub user profile");
  }

  const { id: githubId, email, name, login, avatar_url } = githubUser;

  if (!githubId) {
    throw new ApiError(400, "Invalid GitHub account data");
  }

  // Check if user already exists
  let user = await User.findOne({
    $or: [{ githubId }, { email }],
  });

  // If user exists and was created via local auth, link GitHub account
  if (user) {
    if (user.authProvider === "local" && !user.githubId) {
      user.githubId = githubId;
      user.authProvider = "github";
      user.isEmailVerified = true;

      await user.save({ validateBeforeSave: false });

      console.log("[GitHubAuth] Existing user linked with GitHub");
    }
  }

  // If user does not exist, create a new GitHub user
  if (!user) {
    user = await User.create({
      email: email || `${login}@github.com`,
      fullname: name || login,
      username: login,
      avatar: { url: avatar_url },
      githubId,
      authProvider: "github",
      isEmailVerified: true,
    });

    console.log("[GitHubAuth] New user created via GitHub");
  }

  // Generate access and refresh tokens
  const { accessToken: jwtAccessToken, refreshToken } =
    await generateAccessAndRefereshTokens(user._id);

  // Remove sensitive fields from response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  console.log("[GitHubAuth] Authentication successful");

  return res
    .status(200)
    .cookie("accessToken", jwtAccessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, loggedInUser, "GitHub authentication successful"),
    );
});

// LinkedIn OAuth Controller.....
const linkedinAuthController = asyncHandler(async (req, res) => {
  // Extract LinkedIn authorization code from request body
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "LinkedIn authorization code is required");
  }

  console.log("[LinkedInAuth] Authorization code received");

  // Exchange authorization code for LinkedIn access token
  let accessToken;

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.BASE_URL}/api/v1/auth/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      },
    );

    accessToken = tokenResponse.data.access_token;
  } catch (error) {
    console.error("[LinkedInAuth] Token exchange failed", error.message);
    throw new ApiError(401, "Failed to exchange LinkedIn authorization code");
  }

  if (!accessToken) {
    throw new ApiError(401, "LinkedIn access token not received");
  }

  console.log("[LinkedInAuth] Access token generated");

  // Fetch LinkedIn user profile
  let linkedinUser;

  try {
    const userResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    linkedinUser = userResponse.data;
  } catch (error) {
    console.error("[LinkedInAuth] Failed to fetch user profile", error.message);
    throw new ApiError(401, "Unable to fetch LinkedIn user profile");
  }

  const { sub: linkedinId, email, name, picture } = linkedinUser;

  if (!linkedinId || !email) {
    throw new ApiError(400, "Invalid LinkedIn account data");
  }

  // Check if user already exists
  let user = await User.findOne({
    $or: [{ linkedinId }, { email }],
  });

  // If user exists and was created via local auth, link LinkedIn account
  if (user) {
    if (user.authProvider === "local" && !user.linkedinId) {
      user.linkedinId = linkedinId;
      user.authProvider = "linkedin";
      user.isEmailVerified = true;

      await user.save({ validateBeforeSave: false });

      console.log("[LinkedInAuth] Existing user linked with LinkedIn");
    }
  }

  // If user does not exist, create a new LinkedIn user
  if (!user) {
    user = await User.create({
      email,
      fullname: name,
      username: email.split("@")[0],
      avatar: { url: picture },
      linkedinId,
      authProvider: "linkedin",
      isEmailVerified: true,
    });

    console.log("[LinkedInAuth] New user created via LinkedIn");
  }

  // Generate access and refresh tokens
  const { accessToken: jwtAccessToken, refreshToken } =
    await generateAccessAndRefereshTokens(user._id);

  // Remove sensitive fields from response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  console.log("[LinkedInAuth] Authentication successful");

  return res
    .status(200)
    .cookie("accessToken", jwtAccessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, loggedInUser, "LinkedIn authentication successful"),
    );
});

export { googleAuthController, githubAuthController, linkedinAuthController };
