/**
 * Database Configuration
 * Sequelize ORM setup and MySQL connection
 */

import { Sequelize } from "sequelize";
import {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} from "./env.js";

// Initialize Sequelize instance
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

/**
 * Connect to database
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database connected successfully");

    // Sync models in development (use migrations in production)
    if (NODE_ENV === "development") {
      await sequelize.sync({ alter: false });
      console.log("Database synchronized");
    }
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};
