import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with proper precedence
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Conditionally merges Tailwind CSS classes with proper precedence
 * @param condition - Whether to include the class
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cnIf(condition: boolean, ...inputs: ClassValue[]) {
  return condition ? cn(...inputs) : ''
}

/**
 * Merges multiple class names with proper precedence
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cnAll(...inputs: ClassValue[]) {
  return inputs.map(cn).join(' ')
}
