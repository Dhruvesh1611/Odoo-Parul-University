const prisma = require('../lib/prisma');

const findById = (id) => prisma.shop.findUnique({ where: { id } });
const findBySlug = (slug) => prisma.shop.findUnique({ where: { slug } });

module.exports = {
  findById,
  findBySlug,
};