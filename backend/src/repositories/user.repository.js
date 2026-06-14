const prisma = require('../lib/prisma');

const userSelection = {
  id: true,
  name: true,
  email: true,
  role: true,
  shopId: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  shop: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  },
  managedShop: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  }
};

const userWithPasswordSelection = {
  ...userSelection,
  password: true,
};

const listByShop = async (shopId, page, limit, search) => {
  const filter = { shopId };
  if (search) {
    filter.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (page || limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: filter,
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: userSelection,
        skip,
        take: limitNum
      }),
      prisma.user.count({ where: filter })
    ]);

    return { data, total };
  }

  const data = await prisma.user.findMany({
    where: filter,
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: userSelection,
  });
  return { data, total: data.length };
};

const findByIdAndShop = (id, shopId) =>
  prisma.user.findFirst({
    where: { id, shopId },
    select: userSelection,
  });

const findByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    select: userWithPasswordSelection,
  });

const create = (data) =>
  prisma.user.create({
    data,
    select: userSelection,
  });

const update = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    select: userSelection,
  });

const remove = (id) => prisma.user.delete({ where: { id } });

module.exports = {
  listByShop,
  findByIdAndShop,
  findByEmail,
  create,
  update,
  remove,
};