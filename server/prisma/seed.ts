import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

type SeedProduct = {
  name: string;
  description?: string;
  price: number;
  isPopular?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
};

const CATEGORIES: {
  name: string;
  description: string;
  sortOrder: number;
  products: SeedProduct[];
}[] = [
  {
    name: 'Atıştırmalıklar',
    description: 'Sıcak ve çıtır lezzetler',
    sortOrder: 1,
    products: [
      { name: 'Patates Kızartması', description: 'Çıtır altın patatesler', price: 95, isPopular: true },
      { name: 'Çıtır Tavuk Sepeti', description: 'Özel sosla servis', price: 185, isRecommended: true },
      { name: 'Soğan Halkası', description: 'Çıtır soğan halkaları', price: 110 },
      { name: 'Nugget Tabağı', description: '8 adet tavuk nugget', price: 145 },
      { name: 'Karışık Atıştırmalık Tabağı', description: 'Patates, nugget, soğan halkası, sigara böreği', price: 245, isPopular: true },
      { name: 'Mozzarella Sticks', description: 'Çıtır kaplamalı mozzarella', price: 165 },
      { name: 'Sigara Böreği', description: 'Peynirli el açması', price: 120 },
    ],
  },
  {
    name: 'Soğuk İçecekler',
    description: 'Serinleten lezzetler',
    sortOrder: 2,
    products: [
      { name: 'Limonata', description: 'Ev yapımı taze limonata', price: 75, isPopular: true },
      { name: 'Çilekli Limonata', description: 'Çilek aromalı limonata', price: 85, isNew: true },
      { name: 'Ice Latte', description: 'Soğuk süt ve espresso', price: 110, isRecommended: true },
      { name: 'Ice Americano', description: 'Soğuk americano', price: 95 },
      { name: 'Ice Mocha', description: 'Çikolatalı soğuk kahve', price: 120 },
      { name: 'Milkshake Çikolata', description: 'Bol çikolatalı milkshake', price: 135, isPopular: true },
      { name: 'Milkshake Çilek', description: 'Taze çilekli milkshake', price: 135 },
      { name: 'Kola', description: '330 ml', price: 55 },
      { name: 'Fanta', description: '330 ml', price: 55 },
      { name: 'Sprite', description: '330 ml', price: 55 },
      { name: 'Soda', description: 'Sade veya limonlu', price: 35 },
      { name: 'Su', description: '0.5 L', price: 20 },
    ],
  },
  {
    name: 'Bitki Çayları',
    description: 'Sıcak ve doğal',
    sortOrder: 3,
    products: [
      { name: 'Adaçayı', description: 'Demleme adaçayı', price: 55 },
      { name: 'Ihlamur', description: 'Demleme ıhlamur', price: 55 },
      { name: 'Papatya Çayı', description: 'Rahatlatıcı papatya', price: 55 },
      { name: 'Yeşil Çay', description: 'Antioksidan yeşil çay', price: 55, isRecommended: true },
      { name: 'Kış Çayı', description: 'Karışık baharatlı kış çayı', price: 65, isPopular: true },
      { name: 'Melisa Çayı', description: 'Sakinleştirici melisa', price: 55 },
      { name: 'Nane Limon', description: 'Taze nane ve limon', price: 60, isPopular: true },
      { name: 'Hibiskus Çayı', description: 'Aromatik hibiskus', price: 65, isNew: true },
    ],
  },
  {
    name: 'Tatlılar',
    description: 'Mutluluk getiren tatlılar',
    sortOrder: 4,
    products: [
      { name: 'San Sebastian Cheesecake', description: 'Yanık cheesecake', price: 165, isPopular: true, isRecommended: true },
      { name: 'Brownie', description: 'Sıcak çikolatalı brownie', price: 145 },
      { name: 'Sufle', description: 'Akışkan çikolatalı sufle', price: 155, isPopular: true },
      { name: 'Magnolia', description: 'Muzlu magnolia', price: 135 },
      { name: 'Tiramisu', description: 'Klasik İtalyan tiramisu', price: 145 },
      { name: 'Waffle', description: 'Meyveli ve çikolatalı waffle', price: 175, isRecommended: true },
      { name: 'Mozaik Pasta', description: 'Çikolatalı mozaik', price: 125 },
      { name: 'Profiterol', description: 'Sıcak çikolata soslu', price: 145 },
      { name: 'Frambuazlı Cheesecake', description: 'Frambuaz soslu cheesecake', price: 165, isNew: true },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1) Default admin
  const adminEmail = 'admin@ugurumcafe.com';
  const adminPassword = '123456';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Uğur'um Cafe Admin",
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`  ✓ Admin user (${adminEmail})`);

  // 2) Default settings (single row)
  const existingSetting = await prisma.setting.findFirst();
  if (!existingSetting) {
    await prisma.setting.create({
      data: {
        cafeName: "Uğur'um Cafe",
        slogan: 'Kahve • Huzur • Sohbet',
        themePrimaryColor: '#D8B56D',
        themeBackgroundColor: '#0F0F0F',
        themeCardColor: '#181818',
        themeTextColor: '#F5F5F5',
        themeMutedColor: '#A7A7A7',
      },
    });
    console.log('  ✓ Default settings');
  } else {
    console.log('  · Settings already exist (skipped)');
  }

  // 3) Categories + products
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ Category: ${category.name}`);

    let order = 1;
    for (const p of cat.products) {
      const productSlug = slugify(p.name);
      await prisma.product.upsert({
        where: { slug: productSlug },
        update: {
          name: p.name,
          description: p.description,
          price: new Prisma.Decimal(p.price),
          categoryId: category.id,
          isPopular: p.isPopular ?? false,
          isNew: p.isNew ?? false,
          isRecommended: p.isRecommended ?? false,
          sortOrder: order,
        },
        create: {
          name: p.name,
          slug: productSlug,
          description: p.description,
          price: new Prisma.Decimal(p.price),
          categoryId: category.id,
          isActive: true,
          isPopular: p.isPopular ?? false,
          isNew: p.isNew ?? false,
          isRecommended: p.isRecommended ?? false,
          sortOrder: order,
        },
      });
      order++;
    }
    console.log(`    └─ ${cat.products.length} products`);
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
