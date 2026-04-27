/**
 * Error Handling Middleware
 * Handles 404 errors and global error handling
 */

/**
 * Not Found Middleware
 * Handles requests to undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 * Catches and formats all errors
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
