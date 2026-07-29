import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export class UploadError extends Error {}

// Use Vercel Blob when a token is configured (production on Vercel);
// otherwise fall back to local disk (dev). The returned imageUrl is either a
// local path ("/uploads/x.jpg") or an absolute Blob URL — both work in <img src>.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Save an uploaded receipt image and return a URL/path to it.
 * Returns null if no file was provided.
 */
export async function saveReceiptImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED.has(file.type)) {
    throw new UploadError("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image is too large (max 5 MB).");
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const name = `${randomUUID()}.${ext}`;

  if (useBlob) {
    const blob = await put(`receipts/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`;
}
