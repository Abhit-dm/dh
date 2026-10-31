import { ApiError } from '@/lib/http';
import { duplicateProtectionKey } from '@/lib/security';
import { getPrisma } from '@/lib/prisma';

const WINDOW_MS = 15 * 60_000;
const MAX_SUBMISSIONS_PER_PHONE = 4;

function normalizedPhone(phone: string) {
  return phone.replace(/[\s()+-]/g, '').replace(/^91/, '');
}

export async function enforcePublicSubmissionRateLimit(
  kind: 'appointment' | 'contact',
  phone: string,
) {
  const now = new Date();
  const bucketStart = Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS;
  const expiresAt = new Date(bucketStart + WINDOW_MS);
  const key = duplicateProtectionKey(
    `${kind}|${normalizedPhone(phone)}|${bucketStart}`,
  );
  const prisma = getPrisma();

  await prisma.publicSubmissionRateLimit.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  const limit = await prisma.publicSubmissionRateLimit.upsert({
    where: { key },
    create: { key, attempts: 1, expiresAt },
    update: { attempts: { increment: 1 } },
    select: { attempts: true },
  });

  if (limit.attempts > MAX_SUBMISSIONS_PER_PHONE) {
    throw new ApiError(
      429,
      'SUBMISSION_RATE_LIMITED',
      'Too many requests were submitted from this mobile number. Please try again in 15 minutes.',
    );
  }
}
