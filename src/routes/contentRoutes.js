import express from "express";
import { body, validationResult } from "express-validator";
import * as contentController from "../controllers/contentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  uploadSingleFile,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

const uploadValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Subject must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),
  body("end_time")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date"),
  body("rotation_duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Rotation duration must be a positive integer"),
];

const rejectValidation = [
  body("rejection_reason")
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Rejection reason must be between 10 and 1000 characters"),
];

const scheduleValidation = [
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),
  body("end_time")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date"),
];

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

// Public routes (no authentication)
router.get("/live", contentController.getLiveContent);
router.get("/live/:teacherId", contentController.getLiveContentByTeacher);
router.get("/broadcast-ready", contentController.getBroadcastReadyContent);
router.get("/feed/:subject", contentController.getContentFeedBySubject);

// Teacher routes
router.post(
  "/upload",
  protect,
  authorizeRoles("teacher"),
  uploadSingleFile,
  handleUploadError,
  uploadValidation,
  handleValidationErrors,
  contentController.uploadContent,
);
router.get(
  "/my-uploads",
  protect,
  authorizeRoles("teacher"),
  contentController.getMyUploads,
);

// Principal routes
router.get(
  "/pending",
  protect,
  authorizeRoles("principal"),
  contentController.getPendingContent,
);
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("principal"),
  contentController.approveContent,
);
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("principal"),
  rejectValidation,
  handleValidationErrors,
  contentController.rejectContent,
);
router.post(
  "/:id/schedule",
  protect,
  authorizeRoles("principal"),
  scheduleValidation,
  handleValidationErrors,
  contentController.scheduleContent,
);
router.get(
  "/scheduled",
  protect,
  authorizeRoles("principal"),
  contentController.getScheduledContent,
);

// Must be last to avoid route conflicts
router.get("/:id", protect, contentController.getContentById);

export default router;
