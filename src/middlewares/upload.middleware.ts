import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import config from "../config";
import fs from 'fs/promises';
import path from "path";
import crypto from "crypto";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce-assets",
    allowed_formats: ["jpg", "png", "jpeg"],
  } as any,
});

const UPLOAD_DIR = path.join(process.cwd(), "uploads/products");

const allowedMimeTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const diskStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR); // ✅ ALWAYS call cb
    } catch (err) {
      cb(err as Error, UPLOAD_DIR);
    }
  },

  filename: (req, file, cb) => {
    const ext = allowedMimeTypes[file.mimetype];
    if (!ext) {
      return cb(new Error("Invalid file type"), "");
    }

    const safeName = crypto.randomUUID();
    cb(null, `${safeName}.${ext}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes[file.mimetype]) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

export default upload;

