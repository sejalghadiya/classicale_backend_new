import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../model/user.js";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    console.log("________________________________");
    console.log("Token received from header:", token);
    console.log("________________________________");

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Invalid or missing Authorization token." });
    }

    // ✅ Token extract karne ka safer way
    const tokenWithoutBearer = token.split(" ")[1];
    console.log("Token without 'Bearer':", tokenWithoutBearer);

    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      console.error("❌ JWT_SECRET is not defined in .env file!");
      return res.status(500).json({ error: "Server error: Missing secret key." });
    }
    console.log("Using secret key:", secretKey);

    // ✅ Token decode hone se pehle check karein ki valid format hai ya nahi
    const decoded = jwt.decode(tokenWithoutBearer);
    if (!decoded) {
      console.error("❌ Invalid JWT format detected.");
      return res.status(401).json({ error: "Invalid token format." });
    }
    console.log("Decoded Token (Without Verification):", decoded);

    // ✅ Token verify karna
    const verifiedToken = jwt.verify(tokenWithoutBearer, secretKey);
    console.log("✅ Verified JWT payload:", verifiedToken);

    // ✅ Token me user ka ID check karein
    if (!verifiedToken.id) {
      console.error("❌ Token does not contain user ID.");
      return res.status(401).json({ error: "Invalid token data." });
    }

    // ✅ Database me user ka ID check karein
    const user = await UserModel.findById(verifiedToken.id);
    console.log("User found in database:", user);

    if (!user) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Authentication failed. Please try again." });
  }
};

export default authenticateUser;
