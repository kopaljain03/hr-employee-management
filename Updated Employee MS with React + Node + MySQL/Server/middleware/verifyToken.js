// middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token is invalid" });

    req.user = decoded; // attaches user data to the request object
    next();
  });
};

// middleware/verifyRole.js
export const verifyRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Access denied: " + role + " only" });
    }
    next();
  };
};
