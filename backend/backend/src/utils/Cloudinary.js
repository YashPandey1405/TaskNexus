import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Uploads a local file to Cloudinary and deletes the local copy.
// @param {string} localFilePath - Full path of the file stored temporarily on disk.
// @returns {Promise<object|null>} - Cloudinary upload response object, or null if upload fails.
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Configure Cloudinary using environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Exit early if file path is not provided or file doesn't exist
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return null;
    }

    // Upload to Cloudinary In The TaskNexus_MERN-Project Project......
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "TaskNexus_MERN-Project",
      resource_type: "auto",
    });

    // Industry Standard -> Only Delete File From Server When Uploaded On The Cloud...
    // Delete the local file after upload From The Server......
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Clean up the local file if it still exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
