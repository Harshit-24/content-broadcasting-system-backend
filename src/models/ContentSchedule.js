/**
 * ContentSchedule Model
 * Manages the scheduling and rotation of content within specific slots
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ContentSchedule = sequelize.define(
  "ContentSchedule",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key",
    },
    content_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "contents",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      validate: {
        notNull: {
          msg: "Content ID is required",
        },
        isInt: {
          msg: "Content ID must be an integer",
        },
      },
      comment: "Foreign key to content being scheduled",
    },
    slot_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "content_slots",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      validate: {
        notNull: {
          msg: "Slot ID is required",
        },
        isInt: {
          msg: "Slot ID must be an integer",
        },
      },
      comment: "Foreign key to content slot",
    },
    rotation_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Rotation order is required",
        },
        isInt: {
          msg: "Rotation order must be an integer",
        },
        min: {
          args: [1],
          msg: "Rotation order must be at least 1",
        },
      },
      comment: "Order in which content rotates within the slot",
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Duration is required",
        },
        isInt: {
          msg: "Duration must be an integer",
        },
        min: {
          args: [1],
          msg: "Duration must be at least 1 minute",
        },
        max: {
          args: [1440],
          msg: "Duration cannot exceed 1440 minutes (24 hours)",
        },
      },
      comment: "Duration in minutes for content display",
    },
  },
  {
    tableName: "content_schedules",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_content_schedules_content_id",
        fields: ["content_id"],
      },
      {
        name: "idx_content_schedules_slot_id",
        fields: ["slot_id"],
      },
      {
        name: "idx_content_schedules_rotation_order",
        fields: ["rotation_order"],
      },
      {
        name: "idx_content_schedules_slot_rotation",
        unique: true,
        fields: ["slot_id", "rotation_order"],
      },
    ],
    comment: "Scheduling and rotation configuration for content within slots",
  },
);

export default ContentSchedule;
