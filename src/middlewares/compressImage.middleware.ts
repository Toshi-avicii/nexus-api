import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const UPLOAD_DIR = path.join(process.cwd(), "uploads/products");

const allowedMimeTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const compressProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return next();
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const processedFiles = [];

    for (const file of files) {
      const ext = allowedMimeTypes[file.mimetype];
      const filename = `${crypto.randomUUID()}.${ext}`;
      const outputPath = path.join(UPLOAD_DIR, filename);

      await sharp(file.buffer)
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .webp({ quality: 70 })
        .toFile(outputPath);

      processedFiles.push({
        ...file,
        filename,
        path: outputPath,
      });
    }

    // 🔥 Replace req.files with processed result
    req.files = processedFiles as any;

    next();
  } catch (err) {
    next(err);
  }
};
