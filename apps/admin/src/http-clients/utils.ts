import { parseDate } from '@/lib/date-utils';

/**
 * Recursively converts any valid date strings to Date objects in API response data
 */
export function convertResponseDates<T = any>(data: T): T {
  if (!data) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertResponseDates) as T;
  }

  // Handle strings - check if it's a valid date
  if (typeof data === 'string') {
    const parsedDate = parseDate(data);
    return (parsedDate || data) as T; // Return Date object if valid, otherwise original string
  }

  // Handle objects
  if (typeof data === 'object') {
    const converted: any = {};

    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      converted[key] = convertResponseDates(value);
    });

    return converted;
  }

  // Return primitive values as-is
  return data;
}
