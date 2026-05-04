import { env } from '../config/env';

/**
 * Upload provider abstraction.
 * MVP: only `local` (Multer disk storage). The route handler receives the
 * uploaded file via Multer middleware and asks the active provider to build
 * the public URL. Future providers (Cloudinary, S3, R2) implement the same
 * `UploadProvider` contract and return the same `{ url: string }` shape.
 */
export interface UploadResult {
  url: string;
}

export interface UploadProvider {
  /**
   * Build a publicly reachable URL for an already-saved file.
   * For the local provider, Multer has already written the file to
   * `server/uploads/<filename>` and Express serves `/uploads` statically.
   */
  buildUrl(file: Express.Multer.File): Promise<UploadResult>;
}

class LocalUploadProvider implements UploadProvider {
  async buildUrl(file: Express.Multer.File): Promise<UploadResult> {
    const url = `${env.PUBLIC_BASE_URL.replace(/\/+$/, '')}/uploads/${file.filename}`;
    return { url };
  }
}

function resolveProvider(): UploadProvider {
  switch (env.UPLOAD_PROVIDER) {
    case 'local':
    default:
      return new LocalUploadProvider();
  }
}

const provider = resolveProvider();

export const uploadService = {
  handleUpload(file: Express.Multer.File): Promise<UploadResult> {
    return provider.buildUrl(file);
  },
};
