import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import fs from 'fs';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer storage configuration
 * Generates unique filenames and stores them in 'uploads/' directory
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

/**
 * File filter to accept only PDFs
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only PDF files are allowed.'));
  }
};

/**
 * Multer instance with limits and filter
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

/**
 * Specific middleware for the process endpoint fields
 */
export const documentUpload = upload.fields([
  { name: 'poFile', maxCount: 1 },
  { name: 'grnFile', maxCount: 1 },
  { name: 'invoiceFile', maxCount: 1 },
]);
