import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localpath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github", "linkedin"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    linkedinId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Mongoose pre-save middleware that hashes the user's password before saving it to the DB...
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // When Password Is Not Modified......
    return next();
  }

  // Hashes the password using the bcrypt-algorithm with a salt factor of 10....
  // The number 10 (salt rounds) means bcrypt runs 2^10 = '1024' hashing iterations.
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Example bcrypt hash: '$2b$10$CwTycUXWue0Thq9StjUM0uGv3bV0OxyRJGqr73uj24wFh4u8rZbhy'
// $2b$  -> Bcrypt algorithm version
// 10$   -> Salt rounds (higher = more secure but slower)

// 'userSchema.methods' --> Adds custom method isPasswordCorrect() to Mongoose model.....
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🔐 Generate a JWT Access Token
// 1️⃣ Encrypts user data (_id, email, username) using ACCESS_TOKEN_SECRET
// 2️⃣ Token expires based on ACCESS_TOKEN_EXPIRY (e.g., "1h")
// 3️⃣ Can be verified & decoded using the same secret.....
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
  // For Random Token Secret -> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" ....
};

// 🔐 Generate a Refresh Token (Long-lived Token)
// 1️⃣ Uses only _id for minimal exposure
// 2️⃣ Signed with REFRESH_TOKEN_SECRET (Stored in .env)
// 3️⃣ Expires based on REFRESH_TOKEN_EXPIRY (e.g., "7d")
// 4️⃣ Used to get a new Access Token when the old one expires
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
  // For Random Token Secret -> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" ....
};

// 🔐 Generate a Temporary Token (For Password Reset, Email Verification, etc.)
// 1️⃣ Creates a random 20-byte token (unhashed) to send to the user
// 2️⃣ Hashes the token using SHA-256 before storing it securely in the DB
// 3️⃣ Sets an expiry time of 20 minutes (reduces security risks)
// 4️⃣ Returns { hashedToken, unHashedToken, tokenExpiry }
userSchema.methods.generateTemporaryToken = function () {
  // Creates a random 20-byte token (unhashed, readable)....
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256") // 1️⃣ Create a SHA-256 hash function
    .update(unHashedToken) // 2️⃣ Pass the unhashed token to be hashed
    .digest("hex"); // 3️⃣ Convert the hash output to a hexadecimal string

  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20min

  return { hashedToken, unHashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
