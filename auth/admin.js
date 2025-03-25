import jwt from "jsonwebtoken";
import Admin from "../model/admin.js"; // Adjust the path if needed

// Middleware to authenticate JWT
export const authenticateToken11 = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({ message: "No token provided" });

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    async (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      // Attach the admin to the request object
      req.admin = await Admin.findById(user.id);

      if (!req.admin)
        return res.status(404).json({ message: "Admin not found" });

      next();
    }
  );
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({ message: "No token provided" });

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    async (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      // Attach the admin to the request object
      req.admin = await Admin.findById(user.id);

      if (!req.admin)
        return res.status(404).json({ message: "Admin not found" });

      next();
    }
  );
};

export const admin = (req, res, next) => {
  if (req.admin) {
    console.log("Admin Role:", req.admin.role); // Debug log to check user role
    if (req.admin.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
