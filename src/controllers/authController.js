/**
 * Authentication Controller
 * HTTP request handlers for authentication
 */

import * as authService from "../services/authService.js";

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message, data: null });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({
      name,
      email,
      password,
      role,
    });
    sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    sendError(res, 401, error.message);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    sendSuccess(res, 200, "User profile retrieved successfully", user);
  } catch (error) {
    sendError(res, 404, error.message);
  }
};

export const principalOnly = (req, res) => {
  sendSuccess(res, 200, "Access granted. Welcome, Principal!", {
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
    },
    resource: "principal-only-content",
  });
};

export const teacherOnly = (req, res) => {
  sendSuccess(res, 200, "Access granted. Welcome, Teacher!", {
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
    },
    resource: "teacher-only-content",
  });
};
