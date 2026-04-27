/**
 * Models Index
 * Centralizes model imports, associations, and database instance
 */

import { sequelize } from "../config/db.js";
import User from "./User.js";
import Content from "./Content.js";
import ContentSlot from "./ContentSlot.js";
import ContentSchedule from "./ContentSchedule.js";

/**
 * Initialize Model Associations
 * Defines relationships between models for Sequelize ORM
 */
const initializeAssociations = () => {
  // User <-> Content Associations (Upload Relationship)
  User.hasMany(Content, {
    foreignKey: "uploaded_by",
    as: "uploadedContents",
    onDelete: "RESTRICT", // Prevent user deletion if they have uploaded content
    onUpdate: "CASCADE",
  });

  Content.belongsTo(User, {
    foreignKey: "uploaded_by",
    as: "uploader",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  // User <-> Content Associations (Approval Relationship)
  User.hasMany(Content, {
    foreignKey: "approved_by",
    as: "approvedContents",
    onDelete: "SET NULL", // Allow user deletion, nullify approver reference
    onUpdate: "CASCADE",
  });

  Content.belongsTo(User, {
    foreignKey: "approved_by",
    as: "approver",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  // Content <-> ContentSchedule Associations
  Content.hasMany(ContentSchedule, {
    foreignKey: "content_id",
    as: "schedules",
    onDelete: "CASCADE", // Delete schedules when content is deleted
    onUpdate: "CASCADE",
  });

  ContentSchedule.belongsTo(Content, {
    foreignKey: "content_id",
    as: "content",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // ContentSlot <-> ContentSchedule Associations
  ContentSlot.hasMany(ContentSchedule, {
    foreignKey: "slot_id",
    as: "schedules",
    onDelete: "CASCADE", // Delete schedules when slot is deleted
    onUpdate: "CASCADE",
  });

  ContentSchedule.belongsTo(ContentSlot, {
    foreignKey: "slot_id",
    as: "slot",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

// Initialize all associations
initializeAssociations();

/**
 * Database Object
 * Exports sequelize instance and all models
 */
const db = {
  sequelize,
  User,
  Content,
  ContentSlot,
  ContentSchedule,
};

export default db;
