/**
 * Authentication Routes
 * Defines API endpoints for user authentication and authorization
 * Implements input validation and role-based access control
 */

import express from "express";
import { body, validationResult } from "express-validator";
import * as authController from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Validation rules for user registration
 * Ensures data integrity and security for new user accounts
 */
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage("Password must contain at least one letter and one number"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["principal", "teacher"])
    .withMessage("Role must be either 'principal' or 'teacher'")
    .customSanitizer((value) => value.toLowerCase()),
];

/**
 * Validation rules for user login
 * Validates credentials before authentication attempt
 */
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation error handler middleware
 * Formats and returns validation errors in consistent structure
 * @middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// ============================================================================
// PUBLIC ROUTES - No authentication required
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (teacher or principal)
 * @access  Public
 *
 * NOTE: In production, consider restricting registration or implementing
 * invitation-based registration for principals to prevent unauthorized access.
 * Current implementation allows open registration for assignment testing purposes.
 */
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  authController.register,
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and receive JWT token
 * @access  Public
 */
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.login,
);

// ============================================================================
// PROTECTED ROUTES - Authentication required
// ============================================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Any authenticated user)
 */
router.get("/me", protect, authController.getMe);

// ============================================================================
// ROLE-BASED TEST ROUTES - For testing RBAC implementation
// ============================================================================

/**
 * @route   GET /api/auth/principal-only
 * @desc    Test endpoint for principal-only access
 * @access  Private (Principal role only)
 */
router.get(
  "/principal-only",
  protect,
  authorizeRoles("principal"),
  authController.principalOnly,
);

/**
 * @route   GET /api/auth/teacher-only
 * @desc    Test endpoint for teacher-only access
 * @access  Private (Teacher role only)
 */
router.get(
  "/teacher-only",
  protect,
  authorizeRoles("teacher"),
  authController.teacherOnly,
);

export default router;
