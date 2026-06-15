const prisma = require('../lib/prisma');
const { z } = require('zod');

// Schema Validation
const couponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  discount: z.preprocess((val) => Number(val), z.number().positive()),
  type: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  expiresAt: z.string().optional().nullable().transform(val => val ? new Date(val) : null)
}).superRefine((data, ctx) => {
  if (data.type === 'PERCENTAGE' && data.discount > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discount'],
      message: 'Percentage discount cannot be greater than 100.'
    });
  }
});

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const data = couponSchema.parse(req.body);

    const existing = await prisma.coupon.findUnique({
      where: { code: data.code }
    });

    if (existing) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    const coupon = await prisma.coupon.create({
      data
    });

    res.status(201).json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: "Failed to update coupon status" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({
      where: { id }
    });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon code not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: "Coupon code is inactive" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Coupon code has expired" });
    }

    res.json({
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate coupon" });
  }
};
