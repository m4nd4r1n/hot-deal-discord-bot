import { prisma } from '@repo/database';

const categories = await prisma.category.findMany();
console.log(categories);
