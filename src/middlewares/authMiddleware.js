import { verifyToken } from "../utils/generateToken.js";
import db from "../models/index.js";

const { User } = db;

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role", "created_at", "updated_at"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.message || "Authentication failed. Invalid or expired token.",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Please log in to access this resource.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
