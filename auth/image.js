import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";

const __dirname = path.resolve();
const uploadDirectoryImages = path.join(__dirname, "public", "images");
const uploadDirectoryPdfs = path.join(__dirname, "public", "pdfs");

// 🛠 Check if Folders Exist
if (!fs.existsSync(uploadDirectoryImages)) {
  console.log("📂 Creating images folder...");
  fs.mkdirSync(uploadDirectoryImages, { recursive: true });
}
if (!fs.existsSync(uploadDirectoryPdfs)) {
  console.log("📂 Creating pdfs folder...");
  fs.mkdirSync(uploadDirectoryPdfs, { recursive: true });
}

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = mime.lookup(file.originalname);
    console.log("📄 Original File Name:", file.originalname);
    console.log("MIME Type Detected:", mimeType);

    if (mimeType?.startsWith("image")) {
      console.log("📂 Saving image to:", uploadDirectoryImages);
      cb(null, uploadDirectoryImages);
    } else if (mimeType === "application/pdf") {
      console.log("📂 Saving PDF to:", uploadDirectoryPdfs);
      cb(null, uploadDirectoryPdfs);
    } else {
      console.log("❌ Invalid file type:", mimeType);
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    console.log("📄 File Name:", fileName);
    cb(null, fileName);
  },
});

export const upload = multer({ storage });
