const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');
const userRepository = require('../repositories/user.repository');
const { findById: findShopById } = require('../repositories/shop.repository');
const { sendUserCredentialsEmail } = require('./mailer.service');

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopId: user.shopId,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    shop: user.shop
      ? {
          id: user.shop.id,
          name: user.shop.name,
          slug: user.shop.slug,
        }
      : null,
  };
}

function generateTemporaryPassword() {
  return `${crypto.randomBytes(4).toString('hex')}A1!`;
}

async function ensureTenantAccess(actor) {
  if (!actor?.shopId) {
    throw createError(403, 'Tenant context is missing');
  }

  const shop = await findShopById(actor.shopId);
  if (!shop) {
    throw createError(403, 'Tenant not found');
  }

  return shop;
}

async function listUsers(actor, page, limit, search) {
  await ensureTenantAccess(actor);
  const result = await userRepository.listByShop(actor.shopId, page, limit, search);
  
  if (page || limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return {
      data: result.data.map(toPublicUser),
      pagination: {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum)
      }
    };
  }
  return result.data.map(toPublicUser);
}

async function getUserById(actor, id) {
  await ensureTenantAccess(actor);
  const user = await userRepository.findByIdAndShop(id, actor.shopId);
  if (!user) {
    throw createError(404, 'User not found');
  }

  return toPublicUser(user);
}

async function createUser(actor, payload) {
  const data = createUserSchema.parse(payload);
  await ensureTenantAccess(actor);

  if (actor.role !== 'ADMIN') {
    throw createError(403, 'Only ADMIN users can create staff accounts');
  }

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw createError(400, 'Email is already registered');
  }

  // Use admin-provided password if given, otherwise generate a temporary one
  const plainPassword = data.password || generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    shopId: actor.shopId,
    isActive: true,
  });

  const shop = await findShopById(actor.shopId);
  let emailDelivery = { sent: false, mocked: false };
  try {
    emailDelivery = await sendUserCredentialsEmail({
      to: user.email,
      name: user.name,
      email: user.email,
      password: plainPassword,
      role: user.role,
      shopName: shop?.name || 'your shop',
    });
  } catch (error) {
    emailDelivery = {
      sent: false,
      mocked: false,
      error: error.message,
    };
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MAIL] Unable to send staff credential email:', error.message);
    }
  }

  return {
    user: toPublicUser(user),
    temporaryPassword: process.env.NODE_ENV === 'production' ? undefined : plainPassword,
    emailDelivery,
  };
}

async function updateUser(actor, id, payload) {
  const data = updateUserSchema.parse(payload);
  await ensureTenantAccess(actor);

  if (actor.role !== 'ADMIN') {
    throw createError(403, 'Only ADMIN users can update staff accounts');
  }

  const currentUser = await userRepository.findByIdAndShop(id, actor.shopId);
  if (!currentUser) {
    throw createError(404, 'User not found');
  }

  if (currentUser.role === 'ADMIN' && currentUser.id !== actor.userId) {
    throw createError(400, 'Admin account cannot be reassigned');
  }

  if (data.role === 'ADMIN') {
    throw createError(400, 'Use admin registration to create ADMIN accounts');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await userRepository.update(id, updateData);
  return toPublicUser(updatedUser);
}

async function deleteUser(actor, id) {
  await ensureTenantAccess(actor);

  if (actor.role !== 'ADMIN') {
    throw createError(403, 'Only ADMIN users can delete staff accounts');
  }

  const currentUser = await userRepository.findByIdAndShop(id, actor.shopId);
  if (!currentUser) {
    throw createError(404, 'User not found');
  }

  if (currentUser.role === 'ADMIN') {
    throw createError(400, 'The shop admin account cannot be deleted');
  }

  await userRepository.remove(id);
  return { message: 'User deleted successfully' };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toPublicUser,
};