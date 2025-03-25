import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ Ensure the upload directory exists
const uploadDir = path.join("public", "pdfs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Saving PDF to:", uploadDir); // Debugging line
    cb(null, uploadDir); // Save the file in public/pdfs
  },
  filename: function (req, file, cb) {
    cb(null, `pdfResume-${Date.now()}-${file.originalname}`); // Generate unique filename
  },
});

// ✅ File Filter (Only PDF Allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Accept the PDF file
  } else {
    cb(new Error("Only PDF files are allowed!"), false); // Reject non-PDF files
  }
};

// ✅ Multer Middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB PDF
});

export default upload;
