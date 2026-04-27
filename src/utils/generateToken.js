/**
 * JWT Token Utility
 * Generates and manages JWT tokens for secure authentication
 * Implements token signing, verification, and error handling
 */

import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRE } from "../config/env.js";

/**
 * Generate JWT token for authenticated user
 * Creates a signed token containing user identification and role information
 *
 * @param {Object} payload - Token payload containing user data
 * @param {number} payload.id - User ID (required)
 * @param {string} payload.role - User role: 'principal' or 'teacher' (required)
 * @returns {string} Signed JWT token
 * @throws {Error} If required payload fields are missing
 *
 * @example
 * const token = generateToken({ id: 1, role: 'teacher' });
 */
export const generateToken = (payload) => {
  const { id, role } = payload;

  // Validate required payload fields
  if (!id || !role) {
    throw new Error("User ID and role are required to generate token");
  }

  // Sign and return JWT token
  return jwt.sign(
    {
      id,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE,
      issuer: "content-broadcasting-system",
      audience: "content-broadcasting-api",
    },
  );
};

/**
 * Verify and decode JWT token
 * Validates token signature and expiration, returns decoded payload
 *
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload containing user data
 * @throws {Error} If token is invalid, expired, or malformed
 *
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.id, decoded.role);
 * } catch (error) {
 *   console.error('Token verification failed:', error.message);
 * }
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "content-broadcasting-system",
      audience: "content-broadcasting-api",
    });
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token. Authentication failed.");
    }
    if (error.name === "NotBeforeError") {
      throw new Error("Token not yet valid.");
    }

    // Generic error for unexpected cases
    throw new Error("Token verification failed.");
  }
};
