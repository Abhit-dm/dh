import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';
import { ApiError } from '@/lib/http';

const globalForPrisma = globalThis as typeof globalThis & {
  dhHospitalsPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.dhHospitalsPrisma) {
    return globalForPrisma.dhHospitalsPrisma;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new ApiError(
      503,
      'DATABASE_NOT_CONFIGURED',
      'The SQLite database is not configured. See the backend setup instructions.',
    );
  }
  if (!databaseUrl.startsWith('file:')) {
    throw new ApiError(
      500,
      'DATABASE_CONFIGURATION_INVALID',
      'DATABASE_URL must use a SQLite file URL.',
    );
  }

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const client = new PrismaClient({ adapter });
  globalForPrisma.dhHospitalsPrisma = client;
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  const client = globalForPrisma.dhHospitalsPrisma;
  if (!client) return;
  delete globalForPrisma.dhHospitalsPrisma;
  await client.$disconnect();
}
