import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (_id, email) => {
  const jwtSecret = process.env.classicalProject;
  // return jwt.sign({ userId, firstName }, jwtSecret, { expiresIn: "1h" });
  const token = jwt.sign(
    { id: user._id, email: user.email }, // use userId here
    "ClassicalProject",
    { expiresIn: "1h" }
  );
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded Token:", decoded);
  } catch (error) {
    console.error("Token verification failed:", error);
  }
  return token;
};

console.log(generateToken);
export default generateToken;
