/**
 * ContentSlot Model
 * Manages unique subject-based slots for content broadcasting
 * Each subject represents a distinct logical slot bucket
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ContentSlot = sequelize.define(
  "ContentSlot",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key",
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: "unique_subject",
        msg: "Subject slot already exists",
      },
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
        // Normalize subject to consistent format
        this.setDataValue("subject", value ? value.trim() : value);
      },
      comment: "Unique subject identifier for the slot",
    },
  },
  {
    tableName: "content_slots",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_content_slots_subject",
        unique: true,
        fields: ["subject"],
      },
    ],
    comment:
      "Subject-based slots for organizing content broadcasting schedules",
  },
);

export default ContentSlot;
