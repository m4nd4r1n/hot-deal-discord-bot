export const CATEGORIES = Object.freeze([
  'PC/하드웨어',
  '상품권/쿠폰',
  '게임/SW',
  '노트북/모바일',
  '가전/TV',
  '생활/식품',
  '패션/의류',
  '기타',
] as const);

export const ITEMS = Object.freeze(
  CATEGORIES.map((category) => ({ id: category, label: category })),
);

export const DISCORD_WEBHOOK_GUIDE_URL =
  'https://support.discord.com/hc/ko/articles/228383668-%EC%9B%B9%ED%9B%85%EC%9D%84-%EC%86%8C%EA%B0%9C%ED%95%A9%EB%8B%88%EB%8B%A4';
