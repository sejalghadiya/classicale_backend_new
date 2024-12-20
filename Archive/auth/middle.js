import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../model/user.js";

dotenv.config();
//app.use(express.json());

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    console.log("________________________________");
    console.log("Token received from header:", token);
    console.log("________________________________");

    if (!token) {
      return res
        .status(400)
        .json({ error: "Authorization token not provided." });
    }

    const tokenWithoutBearer = token.replace("Bearer ", "");
    console.log("Token without 'Bearer':", tokenWithoutBearer);

    const secretKey = "classicalProject";
    console.log("Using secret key:", secretKey);

    // Verify JWT token
    const decoded = jwt.verify(tokenWithoutBearer, secretKey);
    console.log("Decoded JWT payload:", decoded);

    // Find the user by ID in the decoded token, not by the token itself
    const user = await UserModel.findById(decoded.id); // Assuming `decoded.id` is the user ID
    console.log("User found in database:", user);

    if (!user) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Attach user information to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res
      .status(401)
      .json({ error: "Authentication failed. Please try again." });
  }
};

export default authenticateUser;
