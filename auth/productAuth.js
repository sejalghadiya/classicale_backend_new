import jwt from "jsonwebtoken";
import { UserModel } from "../model/user.js";
import Admin from "../model/admin.js";

export const protect11 = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "classicaleProject");
      req.user = await UserModel.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user) {
    console.log("User Role:", req.user.role); // Debug log to check user role
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Admins only" });
    }
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "classicaleProject");
      console.log("Decoded Token:", decoded); // Debug log

      req.user = await UserModel.findById(decoded.id);
      //console.log("User:", req.user.); // Debug log

      if (!req.user) {
        return res.status(401).json({ message: "admin not found" });
      }
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
