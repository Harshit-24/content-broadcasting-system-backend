/**
 * Server Entry Point
 * Initializes the application and starts the server
 */

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { PORT, NODE_ENV } from "./src/config/env.js";

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
