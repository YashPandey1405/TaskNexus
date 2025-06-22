# 📁 File Upload Service using Multer

This module handles file uploads in a Node.js application using **Multer**, a middleware for handling `multipart/form-data`, primarily used for uploading files.

Uploaded files (such as user profile images, documents, etc.) are currently stored locally in the `public/images/` directory. In the future, file storage will be moved to a **cloud storage solution like Cloudinary** to ensure better scalability and performance.

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **Multer** – for handling file uploads
- _(Coming soon: Cloudinary for cloud-based image hosting)_

---

## 🛠️ Installation & Setup

1. **Install Dependencies**

   ```bash
   npm install multer
   ```

2. **Ensure Directory Exists**

   The upload destination folder must exist:

   ```
   ./public/images
   ```

   If it doesn't, Multer will throw a "path not found" error.

3. **Use the Middleware in Your Route**

   ```js
   import express from "express";
   import { upload } from "./upload.js";

   const router = express.Router();

   // Single file upload with key = 'avatar'
   router.post("/upload", upload.single("avatar"), (req, res) => {
     res.json({
       message: "File uploaded successfully",
       file: req.file,
     });
   });

   export default router;
   ```

---

## 🧩 File: `multer.middlewares.js`

```js
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/images`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000, // 1MB
  },
});
```

---

## 🌩️ Future Plan: Cloudinary Integration

Currently, files are stored **locally on the server**, which is ideal for development but not scalable in production.

> 🔜 In a future update, the storage mechanism will shift from local disk storage to **[Cloudinary](https://cloudinary.com/)**. This will:
>
> - Offload heavy image storage from the server
> - Provide URLs for optimized delivery
> - Enable image transformations on-the-fly
