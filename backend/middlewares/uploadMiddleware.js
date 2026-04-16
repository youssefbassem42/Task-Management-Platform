const multer = require("multer");
const path = require("path");
const { ensureUploadsDir } = require("../utils/files");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9-_]/g, "-");
    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const createUpload = ({ allowedTypes, message, fileSize = 1024 * 1024 * 10 }) =>
  multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (!allowedTypes || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new Error(message), false);
    },
    limits: {
      fileSize,
    },
  });

const imageUpload = createUpload({
  allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  message: "Only .jpg, .jpeg, .png, and .webp images are allowed",
  fileSize: 1024 * 1024 * 5,
});

const attachmentUpload = createUpload({
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
  ],
  message: "Unsupported file type",
  fileSize: 1024 * 1024 * 10,
});

module.exports = {
  imageUpload,
  attachmentUpload,
};
