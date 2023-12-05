import type { Category } from '@prisma/client';

import { prisma } from './client';

const DEFAULT_CATEGORIES: Array<Partial<Category>> = [
  { category: 'PC/하드웨어' },
  { category: '상품권/쿠폰' },
  { category: '게임/SW' },
  { category: '노트북/모바일' },
  { category: '가전/TV' },
  { category: '생활/식품' },
  { category: '패션/의류' },
  { category: '기타' },
];

(async () => {
  try {
    console.log('Start seeding');
    await Promise.all(
      DEFAULT_CATEGORIES.map((category) =>
        prisma.category.upsert({
          where: { category: category.category },
          update: { ...category },
          create: { category: category.category as string },
        }),
      ),
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Seeding success');
  }
})();
