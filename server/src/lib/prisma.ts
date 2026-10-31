import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { ApiError } from '@/lib/http';

const globalForPrisma = globalThis as typeof globalThis & {
  dhHospitalsPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.dhHospitalsPrisma) {
    return globalForPrisma.dhHospitalsPrisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new ApiError(
      503,
      'DATABASE_NOT_CONFIGURED',
      'The database is not configured. See the backend setup instructions.',
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.dhHospitalsPrisma = client;
  }

  return client;
}
