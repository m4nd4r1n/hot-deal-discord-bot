import { prisma } from '@repo/database';

export default async function Home() {
  const categories = await prisma.category.findMany();
  return (
    <ul>
      {categories.map(({ id, category }) => (
        <li className='mx-auto w-fit' key={id}>
          {category}
        </li>
      ))}
    </ul>
  );
}
