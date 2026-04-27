/**
 * Express Application Configuration
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
