import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { ApiError } from '@/lib/http';

const SCRYPT_COST = 32_768;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
        maxmem: 64 * 1024 * 1024,
      },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

function applicationSecret() {
  const secret = process.env.DATA_HASH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new ApiError(
      503,
      'SERVER_CONFIGURATION_ERROR',
      'The service is not configured correctly.',
    );
  }
  return secret;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt);
  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, cost, blockSize, parallelization, encodedSalt, encodedHash] =
    storedHash.split('$');
  if (
    algorithm !== 'scrypt' ||
    cost !== String(SCRYPT_COST) ||
    blockSize !== String(SCRYPT_BLOCK_SIZE) ||
    parallelization !== String(SCRYPT_PARALLELIZATION) ||
    !encodedSalt ||
    !encodedHash
  ) {
    await deriveKey(password, Buffer.alloc(16, 0x61));
    return false;
  }

  const salt = Buffer.from(encodedSalt, 'base64url');
  const expected = Buffer.from(encodedHash, 'base64url');
  if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

export function createOpaqueSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function duplicateProtectionKey(value: string) {
  return createHmac('sha256', applicationSecret()).update(value).digest('hex');
}

export function setSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `dh_admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `dh_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const configuredOrigin = process.env.APP_ORIGIN;
  if (!origin || !configuredOrigin) {
    throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'This request origin is not allowed.');
  }
  try {
    if (new URL(origin).origin !== new URL(configuredOrigin).origin) {
      throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'This request origin is not allowed.');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'This request origin is not allowed.');
  }
}
