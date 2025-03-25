import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname for ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define upload folders
const uploadFolders = {
  profileImage: path.join(__dirname, "public", "profileImages"),
  aadhaarCardImage1: path.join(__dirname, "public", "aadharcardImages"),
  aadhaarCardImage2: path.join(__dirname, "public", "aadharcardImages"),
};

// Ensure folders exist
Object.values(uploadFolders).forEach((folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// Define single multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if the fieldname exists in the folder mapping
    const folder = uploadFolders[file.fieldname];
    console.log(`Uploading ${file.fieldname} to folder:`, folder);
    if (folder) {
      cb(null, folder);
    } else {
      cb(new Error(`Invalid fieldname: ${file.fieldname}`), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter (Only allow images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPG, JPEG, PNG) are allowed!"), false);
  }
};

// Single upload instance for all files
export const upload = multer({ storage, fileFilter });
