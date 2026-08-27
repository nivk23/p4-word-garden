/**
 * Date helpers for the app
 * Uses local time and supports ?day=YYYY-MM-DD dev override
 */

/**
 * Get today's date as YYYY-MM-DD string (local time)
 * Supports ?day=YYYY-MM-DD dev override in URL
 */
export function getTodayKey(): string {
  const params = new URLSearchParams(window.location.search);
  const dayOverride = params.get("day");

  if (dayOverride && isValidDateFormat(dayOverride)) {
    return dayOverride;
  }

  const today = new Date();
  return formatDate(today);
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterdayKey(): string {
  const today = getTodayKey();
  const date = new Date(today + "T00:00:00");
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is valid YYYY-MM-DD format
 */
function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr + "T00:00:00");
  return !isNaN(date.getTime());
}

/**
 * Get the day of week (0=Sunday, 6=Saturday)
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay();
}

/**
 * Add days to a date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return formatDate(date);
}
