import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ApiError } from '@/lib/http';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const uploadDirectory = () =>
  resolve(process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'));

const imageTypes = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes: Uint8Array) =>
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
  },
} as const;

export async function saveUploadedImage(file: File) {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(400, 'INVALID_IMAGE_SIZE', 'Images must be smaller than 5 MB.');
  }
  const content = Buffer.from(await file.arrayBuffer());
  const detectedType = Object.entries(imageTypes).find(
    ([, type]) => type.matches(content),
  )?.[0] as keyof typeof imageTypes | undefined;
  if (!detectedType || file.type !== detectedType) {
    throw new ApiError(
      400,
      'INVALID_IMAGE_TYPE',
      'Upload a valid JPEG, PNG, or WebP image.',
    );
  }

  const id = randomUUID();
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true });
  const filePath = join(directory, `${id}.${imageTypes[detectedType].extension}`);
  await writeFile(filePath, content, { flag: 'wx', mode: 0o640 });
  return {
    id,
    url: `/api/media/${id}`,
    contentType: detectedType,
    size: content.byteLength,
  };
}

export async function readUploadedImage(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(404, 'NOT_FOUND', 'Image not found.');
  }
  for (const [contentType, type] of Object.entries(imageTypes)) {
    try {
      const body = await readFile(join(uploadDirectory(), `${id}.${type.extension}`));
      return { body, contentType };
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new ApiError(404, 'NOT_FOUND', 'Image not found.');
}

export const MAX_UPLOAD_BYTES = MAX_IMAGE_BYTES;
