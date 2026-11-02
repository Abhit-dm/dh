import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

export async function createSqliteTestDatabase() {
  const directory = await mkdtemp(
    join(process.cwd(), 'prisma', '.dh-hospitals-test-'),
  );
  const relativePath = relative(
    process.cwd(),
    join(directory, 'test.sqlite'),
  ).replace(/\\/g, '/');
  const databaseUrl = `file:./${relativePath}`;
  process.env.DATABASE_URL = databaseUrl;

  try {
    execFileSync(
      process.execPath,
      [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
      { cwd: process.cwd(), stdio: 'inherit' },
    );
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }

  return {
    url: databaseUrl,
    cleanup: async () => {
      const { disconnectPrisma } = await import('@/lib/prisma');
      await disconnectPrisma();
      await rm(directory, { recursive: true, force: true });
    },
  };
}
