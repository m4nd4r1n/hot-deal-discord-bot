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
