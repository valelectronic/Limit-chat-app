
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }
//    // Decode the token using jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
//    // Verify the token and decode it
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
//    // Find the user by ID from the decoded token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    // Attach user to the request object for further use in the route handlers
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};