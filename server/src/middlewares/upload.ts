import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../config/env';

// Resolve the uploads directory.
// Priority: explicit UPLOAD_DIR env (e.g. Railway Volume mount path) -> default <server>/uploads
const DEFAULT_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const UPLOAD_DIR = env.UPLOAD_DIR && env.UPLOAD_DIR.trim().length > 0
  ? path.resolve(env.UPLOAD_DIR)
  : DEFAULT_UPLOAD_DIR;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '.jpg';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    const err = new Error('Only jpg, jpeg, png, webp images are allowed.') as Error & { code?: string };
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export { UPLOAD_DIR };
