import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to save a base64 image
export const saveBase64Image = (base64String, folderPath, filenamePrefix) => {
  const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image string");
  }

  const imageExtension = matches[1].split("/")[1]; // e.g., 'png', 'jpeg'
  const imageData = matches[2];
  const buffer = Buffer.from(imageData, "base64");

  const filename = `${filenamePrefix}_${Date.now()}.${imageExtension}`;

  // Go to root -> public -> folderPath (like profileImages or aadharcardImages)
  const fullFolderPath = path.join(__dirname, "..", "public", folderPath);

  if (!fs.existsSync(fullFolderPath)) {
    fs.mkdirSync(fullFolderPath, { recursive: true });
  }

  const filePath = path.join(fullFolderPath, filename);
  fs.writeFileSync(filePath, buffer);

  return `/public/${folderPath}/${filename}`;
};
