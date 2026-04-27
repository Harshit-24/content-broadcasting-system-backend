/**
 * Environment Variables Configuration
 * Centralizes access to environment variables
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Server
export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 5000;

// Database
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_NAME = process.env.DB_NAME || "content_broadcasting_db";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
export const UPLOAD_PATH = process.env.UPLOAD_PATH || "./src/uploads";
