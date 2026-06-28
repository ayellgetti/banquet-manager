import { format } from "date-fns";

/** Local calendar date as yyyy-MM-dd (avoids UTC drift from toISOString). */
export function getTodayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isPastEventDate(date: string): boolean {
  if (!date) return false;
  return date < getTodayISO();
}

export function validateEventDate(date: string, t: (key: string) => string): string | null {
  if (!date.trim()) return t("validate.eventDateRequired");
  if (isPastEventDate(date)) return t("validate.eventDatePast");
  return null;
}

/** Use for date input min attribute — today is allowed. */
export function getMinEventDateISO(): string {
  return getTodayISO();
}

/** Clamp pre-filled dates from calendar clicks so past days cannot be submitted. */
export function sanitizeEventDate(date?: string): string {
  if (!date) return "";
  return isPastEventDate(date) ? getTodayISO() : date;
}
