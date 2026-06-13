const prisma = require('../lib/prisma');

const userSelection = {
  shop: true,
  managedShop: true,
};

const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: userSelection,
  });

const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: userSelection,
  });

const createAdminWithShop = async ({ userData, shopData }) => {
  return prisma.$transaction(async (tx) => {
    const adminUser = await tx.user.create({
      data: {
        ...userData,
        shopId: null,
      },
    });

    const shop = await tx.shop.create({
      data: {
        ...shopData,
        adminId: adminUser.id,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: adminUser.id },
      data: { shopId: shop.id },
      include: userSelection,
    });

    return { user: updatedUser, shop };
  });
};

const touchLastLogin = (id) =>
  prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
    include: userSelection,
  });

const updatePassword = (id, password) =>
  prisma.user.update({
    where: { id },
    data: { password },
    include: userSelection,
  });

module.exports = {
  findUserByEmail,
  findUserById,
  createAdminWithShop,
  touchLastLogin,
  updatePassword,
};