/**
 * Authentication Service
 * Business logic for user authentication and authorization
 */

import bcrypt from "bcrypt";
import db from "../models/index.js";
import { generateToken } from "../utils/generateToken.js";

const { User } = db;
const BCRYPT_SALT_ROUNDS = 10;

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  if (!name?.trim()) throw new Error("Name is required");
  if (!email?.trim()) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  if (!role) throw new Error("Role is required");
  if (!["principal", "teacher"].includes(role)) {
    throw new Error("Invalid role. Must be either 'principal' or 'teacher'");
  }

  const existingUser = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash,
    role,
  });

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
};

export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  if (!email?.trim()) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");

  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    token,
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "role", "created_at", "updated_at"],
  });

  if (!user) throw new Error("User not found");
  return user;
};
