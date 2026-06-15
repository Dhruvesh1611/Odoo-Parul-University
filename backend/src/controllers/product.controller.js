// backend/src/controllers/product.controller.js
const prisma = require('../lib/prisma');
const { z } = require('zod');
const { isPrismaDatabaseUnavailable } = require('../lib/prisma-errors');
const { showcaseCategories, showcaseProducts, showcaseStats } = require('../lib/showcase-data');

// Validation Schemas
const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive()),
    unit: z.string().optional(),
    tax: z.preprocess((val) => Number(val), z.number().min(0)).optional(),
    categoryId: z.string(),
    isAvailable: z.boolean().optional(),
    sendToKitchen: z.boolean().optional(),
    imageUrl: z.string().optional(),
    variants: z.array(z.object({
        name: z.string().min(1, 'Variant name cannot be empty'),
        extraPrice: z.preprocess((val) => Number(val), z.number().min(0))
    })).optional()
});

const categorySchema = z.object({
    name: z.string().min(1)
});

// Category Controllers
exports.createCategory = async (req, res) => {
    try {
        const { name } = categorySchema.parse(req.body);
        const category = await prisma.category.create({ data: { name } });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.errors || error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } }
        });
        res.json(categories);
    } catch (error) {
        if (isPrismaDatabaseUnavailable(error)) {
            return res.json(showcaseCategories);
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id } });
        res.json({ message: "Category deleted" });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete category containing products." });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getProductsStats = async (req, res) => {
    try {
        const [total, available, kitchen, avgPriceData] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { isAvailable: true } }),
            prisma.product.count({ where: { sendToKitchen: true } }),
            prisma.product.aggregate({
                _avg: { price: true }
            })
        ]);
        res.json({
            total,
            available,
            kitchen,
            avgPrice: Number(avgPriceData._avg.price || 0)
        });
    } catch (error) {
        if (isPrismaDatabaseUnavailable(error)) {
            return res.json(showcaseStats);
        }
        res.status(500).json({ error: error.message });
    }
};

// Product Controllers
exports.createProduct = async (req, res) => {
    try {
        const data = productSchema.parse(req.body);
        const { variants, ...productData } = data;

        // Strip any accidental extra fields from variants (e.g. id, productId from frontend)
        const cleanVariants = variants?.map(v => ({
            name: v.name,
            extraPrice: Number(v.extraPrice) || 0
        }));

        const product = await prisma.product.create({
            data: {
                ...productData,
                variants: cleanVariants && cleanVariants.length > 0 ? {
                    create: cleanVariants
                } : undefined
            },
            include: { variants: true, category: true }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('createProduct error:', error);
        res.status(400).json({ error: error.errors || error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { categoryId, page, limit, search } = req.query;
        const filter = {};
        if (categoryId && categoryId !== 'all') filter.categoryId = categoryId;
        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (page || limit) {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            const skip = (pageNum - 1) * limitNum;

            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where: filter,
                    include: { variants: true, category: true },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limitNum
                }),
                prisma.product.count({ where: filter })
            ]);

            return res.json({
                data: products,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
        }

        const products = await prisma.product.findMany({
            where: filter,
            include: { variants: true, category: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        if (isPrismaDatabaseUnavailable(error)) {
            const { categoryId, page, limit, search } = req.query;
            let products = showcaseProducts;

            if (categoryId && categoryId !== 'all') {
                products = products.filter((product) => product.category?.id === categoryId || product.category?.name === categoryId);
            }

            if (search) {
                const normalizedSearch = String(search).toLowerCase();
                products = products.filter((product) =>
                    product.name.toLowerCase().includes(normalizedSearch) ||
                    (product.description || '').toLowerCase().includes(normalizedSearch)
                );
            }

            if (page || limit) {
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(limit) || 20;
                const skip = (pageNum - 1) * limitNum;
                const pagedProducts = products.slice(skip, skip + limitNum);

                return res.json({
                    data: pagedProducts,
                    pagination: {
                        total: products.length,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(products.length / limitNum)
                    }
                });
            }

            return res.json(products);
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = productSchema.partial().parse(req.body);
        const { variants, ...productData } = data;

        // Strip extra DB fields from variants (id, productId, createdAt, updatedAt)
        // These come back from the frontend when editing an existing product
        const cleanVariants = variants?.map(v => ({
            name: v.name,
            extraPrice: Number(v.extraPrice) || 0
        }));

        const product = await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id },
                data: productData
            });

            if (cleanVariants) {
                // Delete existing variants and recreate with the new list
                await tx.variant.deleteMany({ where: { productId: id } });
                if (cleanVariants.length > 0) {
                    await tx.variant.createMany({
                        data: cleanVariants.map(v => ({ ...v, productId: id }))
                    });
                }
            }

            return tx.product.findUnique({
                where: { id },
                include: { variants: true, category: true }
            });
        });

        res.json(product);
    } catch (error) {
        console.error('updateProduct error:', error);
        res.status(400).json({ error: error.errors || error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.$transaction([
            prisma.variant.deleteMany({ where: { productId: id } }),
            prisma.product.delete({ where: { id } })
        ]);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Product not found." });
        }

        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete product because it is part of existing orders." });
        }

        res.status(500).json({ error: error.message });
    }
};
