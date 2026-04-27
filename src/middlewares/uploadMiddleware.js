import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { MAX_FILE_SIZE } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../src/uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_FILE_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/jpg": ".jpg",
  "application/pdf": ".pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniquePrefix = `${timestamp}-${randomString}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${uniquePrefix}-${sanitizedName}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPEG, JPG, and PDF files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadSingleFile = upload.single("file");

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        data: null,
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field name. Use 'file' as the field name.",
        data: null,
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      data: null,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  next();
};
