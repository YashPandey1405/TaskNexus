import multer from "multer";

const storage = multer.memoryStorage(); // ✅ No disk writing

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // This storage needs public/images folder in the root directory
//     // Else it will throw an error saying cannot find path public/images
//     cb(null, `./backend/public/images`);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// Middleware responsible to read form data and upload the File object to the mentioned path
export const upload = multer({
  storage,
  // Max File Size Support Of 3 MB.....
  limits: {
    fileSize: 3 * 1000 * 1000,
  },
});

export default upload;
