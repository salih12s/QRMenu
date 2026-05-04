/**
 * Strip absolute http(s)://localhost host from image URLs in the remote DB,
 * leaving only the relative /uploads/<file> path. Run once after deploying
 * the upload-service change.
 *   cd server && npx ts-node prisma/normalize-image-urls.ts
 */
import { PrismaClient } from '@prisma/client';

const REMOTE_URL =
  'postgresql://postgres:ZUYJMLfpLtOIxOBlEjXpOLaSdkAVpFHl@tramway.proxy.rlwy.net:19634/railway?sslmode=require';

const prisma = new PrismaClient({ datasources: { db: { url: REMOTE_URL } } });

const STALE_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/uploads\/.+)$/i;

function normalize(url: string | null): string | null {
  if (!url) return url;
  const m = url.match(STALE_HOST_RE);
  return m ? m[3] : url;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  let pUpdated = 0;
  for (const p of products) {
    const next = normalize(p.imageUrl);
    if (next !== p.imageUrl) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: next } });
      pUpdated++;
    }
  }

  const settings = await prisma.setting.findMany();
  let sUpdated = 0;
  for (const s of settings) {
    const next = normalize(s.logoUrl);
    if (next !== s.logoUrl) {
      await prisma.setting.update({ where: { id: s.id }, data: { logoUrl: next } });
      sUpdated++;
    }
  }

  console.log(`✅ products updated: ${pUpdated}`);
  console.log(`✅ settings updated: ${sUpdated}`);
}

main()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
