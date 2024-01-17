import { prisma } from '@repo/database';

import type { Post, PostUrl } from '@/types';

export const savePosts = (postUrls: PostUrl[]) =>
  prisma.$transaction([prisma.post.deleteMany(), prisma.post.createMany({ data: postUrls })]);

export const getNewPosts = (prevPosts: PostUrl[], posts: Post[]) =>
  filterPostsByUrlMap(posts, createPostUrlMap(prevPosts));

const createPostUrlMap = (post: PostUrl[]) =>
  post.reduce((map, { url }) => {
    map.set(url, true);
    return map;
  }, new Map<string, boolean>());

const filterPostsByUrlMap = (posts: Post[], postUrlMap: Map<string, boolean>) =>
  posts.filter(({ url }) => !postUrlMap.get(url));

export const loadPosts = () => prisma.post.findMany({ select: { url: true } });

export const createPostUrlArray = (posts: Post[]): PostUrl[] => posts.map(({ url }) => ({ url }));
