/**
 * @link e:\git\hyphae-pos\src\lib\utils.ts
 * @author Hyphae POS Team
 * @description Tailwind CSS class merging and variant utilities.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { cva } from 'class-variance-authority';
export { cva };
