/**
 * Copies all data from LOCAL Postgres to REMOTE (Railway) Postgres via Prisma.
 * Usage:
 *   cd server
 *   npx ts-node prisma/migrate-data.ts
 */
import { PrismaClient } from '@prisma/client';

const LOCAL_URL = 'postgresql://postgres:12345@localhost:5432/QRMenu';
const REMOTE_URL =
  'postgresql://postgres:ZUYJMLfpLtOIxOBlEjXpOLaSdkAVpFHl@tramway.proxy.rlwy.net:19634/railway?sslmode=require';

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const remote = new PrismaClient({ datasources: { db: { url: REMOTE_URL } } });

async function main() {
  console.log('🔌 Reading from LOCAL...');
  const [users, settings, categories, products] = await Promise.all([
    local.user.findMany(),
    local.setting.findMany(),
    local.category.findMany(),
    local.product.findMany(),
  ]);
  console.log(
    `   users=${users.length}  settings=${settings.length}  categories=${categories.length}  products=${products.length}`,
  );

  console.log('🧹 Wiping REMOTE...');
  await remote.product.deleteMany({});
  await remote.category.deleteMany({});
  await remote.user.deleteMany({});
  await remote.setting.deleteMany({});

  console.log('⬆️  Writing to REMOTE...');
  for (const u of users) await remote.user.create({ data: u });
  for (const s of settings) await remote.setting.create({ data: s });
  for (const c of categories) await remote.category.create({ data: c });
  for (const p of products) await remote.product.create({ data: p });

  // Reset sequences so future inserts pick up from max id
  const reset = async (table: string, col = 'id') => {
    await remote.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', '${col}'), COALESCE((SELECT MAX(${col}) FROM "${table}"), 1));`,
    );
  };
  await reset('users');
  await reset('settings');
  await reset('categories');
  await reset('products');

  console.log('✅ Migration complete.');
}

main()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await remote.$disconnect();
  });
