const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { slugify } = require('../src/utils/slugify');

async function clearDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();
}

async function createTenant() {
  const password = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@odoo-cafe.com',
      password,
      role: 'ADMIN',
      isActive: true,
      shopId: null,
    },
  });

  const shop = await prisma.shop.create({
    data: {
      name: 'Odoo Cafe',
      slug: `${slugify('Odoo Cafe')}-${crypto.randomBytes(3).toString('hex')}`,
      adminId: admin.id,
    },
  });

  await prisma.user.update({
    where: { id: admin.id },
    data: { shopId: shop.id },
  });

  const staff = [
    { name: 'Jagjeet Singh', email: 'jagjeet@odoo-cafe.com', role: 'EMPLOYEE' },
    { name: 'Gordon Ramsay', email: 'gordon@odoo-cafe.com', role: 'KITCHEN' },
  ];

  for (const member of staff) {
    await prisma.user.create({
      data: {
        name: member.name,
        email: member.email,
        password,
        role: member.role,
        shopId: shop.id,
        isActive: true,
      },
    });
  }

  return { admin, shop };
}

async function main() {
  console.log('🌱 Starting seed...');

  await clearDatabase();

  await createTenant();

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
