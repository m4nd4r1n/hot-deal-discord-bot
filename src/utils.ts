export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

export const contains = <T extends string>(
  list: ReadonlyArray<T>,
  value: string
): value is T => {
  return list.some((item) => item === value);
};

export const every = <T extends string>(
  origin: string[],
  target: ReadonlyArray<T>
): origin is T[] => {
  return origin.every((value) => contains(target, value));
};
