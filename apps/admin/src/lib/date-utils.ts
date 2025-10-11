import { isValid, parseISO } from 'date-fns';

function isStrictValidDate(str: string): boolean {
  const parsed = parseISO(str);
  return isValid(parsed);
}

/**
 * Safe date parser that returns null for invalid dates instead of throwing
 * @param dateInput - The date input to parse
 * @returns Date object or null if invalid
 */
export function parseDate<T>(dateInput: T): T | Date {
  if (!dateInput) return dateInput;

  if (typeof dateInput !== 'string') return dateInput;

  return isStrictValidDate(dateInput) ? new Date(dateInput) : dateInput;
}

/**
 * Format a date in a human-readable format
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
