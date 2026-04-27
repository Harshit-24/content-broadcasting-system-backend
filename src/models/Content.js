/**
 * Content Model
 * Manages uploaded content files with approval workflow and scheduling
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Content = sequelize.define(
  "Content",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title is required",
        },
        notEmpty: {
          msg: "Title cannot be empty",
        },
        len: {
          args: [3, 255],
          msg: "Title must be between 3 and 255 characters",
        },
      },
      set(value) {
        // Trim whitespace
        this.setDataValue("title", value ? value.trim() : value);
      },
      comment: "Content title",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      set(value) {
        // Trim whitespace and handle empty strings
        const trimmed = value ? value.trim() : null;
        this.setDataValue("description", trimmed || null);
      },
      comment: "Optional content description",
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Subject is required",
        },
        notEmpty: {
          msg: "Subject cannot be empty",
        },
        len: {
          args: [2, 100],
          msg: "Subject must be between 2 and 100 characters",
        },
      },
      set(value) {
        // Trim whitespace
        this.setDataValue("subject", value ? value.trim() : value);
      },
      comment: "Subject category for content",
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notNull: {
          msg: "File path is required",
        },
        notEmpty: {
          msg: "File path cannot be empty",
        },
      },
      comment: "Relative or absolute path to uploaded file",
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: "File type is required",
        },
        notEmpty: {
          msg: "File type cannot be empty",
        },
      },
      comment: "MIME type or file extension",
    },
    file_size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notNull: {
          msg: "File size is required",
        },
        isInt: {
          msg: "File size must be an integer",
        },
        min: {
          args: [1],
          msg: "File size must be greater than 0",
        },
      },
      comment: "File size in bytes",
    },
    uploaded_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      comment: "Foreign key to user who uploaded the content",
    },
    status: {
      type: DataTypes.ENUM("uploaded", "pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        notNull: {
          msg: "Status is required",
        },
        isIn: {
          args: [["uploaded", "pending", "approved", "rejected"]],
          msg: "Status must be uploaded, pending, approved, or rejected",
        },
      },
      comment: "Content approval status",
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      set(value) {
        // Trim whitespace and handle empty strings
        const trimmed = value ? value.trim() : null;
        this.setDataValue("rejection_reason", trimmed || null);
      },
      comment: "Reason for rejection if status is rejected",
    },
    approved_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Foreign key to user who approved/rejected the content",
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when content was approved/rejected",
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Start time must be a valid date",
        },
      },
      comment: "Scheduled start time for content broadcasting",
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "End time must be a valid date",
        },
        isAfterStartTime(value) {
          if (value && this.start_time && value <= this.start_time) {
            throw new Error("End time must be after start time");
          }
        },
      },
      comment: "Scheduled end time for content broadcasting",
    },
  },
  {
    tableName: "contents",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_contents_uploaded_by",
        fields: ["uploaded_by"],
      },
      {
        name: "idx_contents_approved_by",
        fields: ["approved_by"],
      },
      {
        name: "idx_contents_status",
        fields: ["status"],
      },
      {
        name: "idx_contents_subject",
        fields: ["subject"],
      },
      {
        name: "idx_contents_start_time",
        fields: ["start_time"],
      },
      {
        name: "idx_contents_end_time",
        fields: ["end_time"],
      },
      {
        name: "idx_contents_status_subject",
        fields: ["status", "subject"],
      },
    ],
    comment: "Content files with approval workflow and scheduling metadata",
  },
);

export default Content;
