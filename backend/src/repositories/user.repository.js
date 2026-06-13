const prisma = require('../lib/prisma');

const userSelection = {
  shop: true,
  managedShop: true,
};

const listByShop = (shopId) =>
  prisma.user.findMany({
    where: { shopId },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    include: userSelection,
  });

const findByIdAndShop = (id, shopId) =>
  prisma.user.findFirst({
    where: { id, shopId },
    include: userSelection,
  });

const findByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: userSelection,
  });

const create = (data) =>
  prisma.user.create({
    data,
    include: userSelection,
  });

const update = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    include: userSelection,
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