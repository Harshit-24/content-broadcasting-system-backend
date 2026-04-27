/**
 * Test Routes
 * Basic route for API health check
 */

import express from "express";

const router = express.Router();

/**
 * @route   GET /api/test
 * @desc    Test API endpoint
 * @access  Public
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Running",
  });
});

export default router;
