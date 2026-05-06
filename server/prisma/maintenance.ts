/**
 * Maintenance script.
 *
 * Modes:
 *  - WIPE_DATA=true  -> Deletes ALL products, categories, settings.
 *                      Also deletes any user whose email is NOT in KEEP_EMAILS.
 *                      (Used to reset production data while keeping admins.)
 *  - WIPE_DATA=false -> Only upserts the two admin accounts (safe for local).
 *
 * Always upserts these two admin users with password "Uğurcafe33":
 *  - admin@ugurcafe.com
 *  - yonetici@ugurcafe.com
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_PASSWORD = 'Uğurcafe33';

const ADMINS = [
  { email: 'admin@ugurcafe.com', name: "Uğur Cafe Admin" },
  { email: 'yonetici@ugurcafe.com', name: "Uğur Cafe Yönetici" },
];

const KEEP_EMAILS = ADMINS.map((a) => a.email);

async function upsertAdmins() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  for (const a of ADMINS) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: { passwordHash, name: a.name, role: 'ADMIN' },
      create: { name: a.name, email: a.email, passwordHash, role: 'ADMIN' },
    });
    console.log(`  ✓ Admin upserted: ${a.email}`);
  }
}

async function wipeData() {
  // Order matters: products -> categories (FK), then settings, then non-admin users.
  const delProducts = await prisma.product.deleteMany({});
  console.log(`  ✗ Deleted ${delProducts.count} products`);

  const delCategories = await prisma.category.deleteMany({});
  console.log(`  ✗ Deleted ${delCategories.count} categories`);

  const delSettings = await prisma.setting.deleteMany({});
  console.log(`  ✗ Deleted ${delSettings.count} settings rows`);

  const delUsers = await prisma.user.deleteMany({
    where: { email: { notIn: KEEP_EMAILS } },
  });
  console.log(`  ✗ Deleted ${delUsers.count} non-admin users`);
}

async function main() {
  const wipe = process.env.WIPE_DATA === 'true';
  console.log(`🔧 Maintenance start (wipe=${wipe})`);

  if (wipe) {
    await wipeData();
  }
  await upsertAdmins();

  console.log('✅ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
