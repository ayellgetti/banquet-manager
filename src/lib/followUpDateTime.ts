import { addDays, format, isToday, parseISO, startOfDay } from "date-fns";

export const FOLLOW_UP_DISPLAY_FORMAT = "MMM d, yyyy · h:mm a";

export function parseFollowUpDateTime(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseISO(`${value}T09:00:00`);
  }

  return parseISO(value);
}

export function formatFollowUpDateTime(value: string): string {
  return format(parseFollowUpDateTime(value), FOLLOW_UP_DISPLAY_FORMAT);
}

export function followUpDateKey(value: string): string {
  return format(parseFollowUpDateTime(value), "yyyy-MM-dd");
}

export function splitFollowUpDateTime(value?: string): { date: string; time: string } {
  if (!value) {
    return { date: "", time: "09:00" };
  }

  const parsed = parseFollowUpDateTime(value);
  return {
    date: format(parsed, "yyyy-MM-dd"),
    time: format(parsed, "HH:mm"),
  };
}

export function combineFollowUpDateTime(date: string, time: string): string {
  if (!date) return "";
  const normalizedTime = time || "09:00";
  return `${date}T${normalizedTime}:00`;
}

export function toApiFollowUpDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseISO(`${value}T09:00:00`).toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const parsed = parseISO(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return value;
}

export function getFollowUpUrgency(nextFollowUpDate: string | undefined, now = new Date()) {
  if (!nextFollowUpDate) return "none" as const;

  const scheduled = parseFollowUpDateTime(nextFollowUpDate);
  if (scheduled < now) return "overdue" as const;
  if (isToday(scheduled)) return "due" as const;
  return "scheduled" as const;
}

export function isFollowUpOverdue(nextFollowUpDate: string | undefined, now = new Date()): boolean {
  if (!nextFollowUpDate) return false;
  return parseFollowUpDateTime(nextFollowUpDate) < now;
}

export function isFollowUpDueThisWeek(
  nextFollowUpDate: string | undefined,
  today = new Date(),
): boolean {
  if (!nextFollowUpDate) return false;

  const key = followUpDateKey(nextFollowUpDate);
  const todayKey = format(today, "yyyy-MM-dd");
  const weekEnd = format(addDays(startOfDay(today), 7), "yyyy-MM-dd");
  return key >= todayKey && key <= weekEnd;
}
