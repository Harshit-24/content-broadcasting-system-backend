/**
 * User Model
 * Manages system users with role-based access (principals and teachers)
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Name is required",
        },
        notEmpty: {
          msg: "Name cannot be empty",
        },
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters",
        },
      },
      comment: "Full name of the user",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: "unique_email",
        msg: "Email address already registered",
      },
      validate: {
        notNull: {
          msg: "Email is required",
        },
        notEmpty: {
          msg: "Email cannot be empty",
        },
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
      set(value) {
        // Normalize email to lowercase
        this.setDataValue("email", value ? value.toLowerCase().trim() : value);
      },
      comment: "Unique email address for authentication",
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password hash is required",
        },
        notEmpty: {
          msg: "Password hash cannot be empty",
        },
      },
      comment: "Bcrypt hashed password",
    },
    role: {
      type: DataTypes.ENUM("principal", "teacher"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Role is required",
        },
        isIn: {
          args: [["principal", "teacher"]],
          msg: "Role must be either principal or teacher",
        },
      },
      comment: "User role for access control",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_users_email",
        unique: true,
        fields: ["email"],
      },
      {
        name: "idx_users_role",
        fields: ["role"],
      },
    ],
    comment: "System users with role-based access control",
  },
);

export default User;
