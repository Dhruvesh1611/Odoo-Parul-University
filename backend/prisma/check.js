const prisma = require('../src/lib/prisma');

async function main() {
    console.log('Users:', await prisma.user.count());
    console.log('Shops:', await prisma.shop.count());
    console.log('Categories:', await prisma.category.count());
    console.log('Products:', await prisma.product.count());
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });