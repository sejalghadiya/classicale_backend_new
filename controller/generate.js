import jwt from "jsonwebtoken";
import config from "../utils/config";

const generateToken = (_id, email) => {
  const jwtSecret = config.jwt.secret;
  const token = jwt.sign(
    { id: _id, email: email }, // use userId here
    jwtSecret,
    { expiresIn: config.jwt.expiresIn }
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
