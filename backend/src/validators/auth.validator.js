const { z } = require('zod');

const emailSchema = z.string().trim().email('Valid email is required');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');
const nameSchema = z.string().trim().min(1, 'Name is required').max(120);
const shopNameSchema = z.string().trim().min(2, 'Shop name is required').max(120);

const registerSchema = z.object({
  shopName: shopNameSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: passwordSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};