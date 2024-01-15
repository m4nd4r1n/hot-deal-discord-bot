import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wrapTryCatch =
  <T extends unknown[], U, W>(fn: (...args: T) => U, errorHandler: (error: Error) => W) =>
  async (...args: T) => {
    try {
      return await fn(...args);
    } catch (e) {
      return errorHandler(e);
    }
  };
