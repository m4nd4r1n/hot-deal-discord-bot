import { prisma } from '@repo/database';

import { scrapeHotDeals } from '@/scrape';

export const savePosts = (postUrls: { url: string }[]) =>
  prisma.$transaction([prisma.post.deleteMany(), prisma.post.createMany({ data: postUrls })]);

export const getNewPosts = async () => {
  const [prevPosts, posts] = await Promise.all([loadPosts(), scrapeHotDeals()]);
  const postUrlMap = createPostUrlMap(prevPosts);
  const newPosts = posts.filter(({ url }) => !postUrlMap.get(url));
  return [newPosts, posts] as const;
};

const loadPosts = () => prisma.post.findMany({ select: { url: true } });

const createPostUrlMap = (posts: { url: string }[]) => {
  const postUrlMap = new Map<string, boolean>();
  posts.forEach(({ url }) => {
    postUrlMap.set(url, true);
  });
  return postUrlMap;
};
