import { DECOR_OPTIONS, VENUE_OPTIONS } from "@/data/enquiryOptions";
import type { BookingRecord } from "@/data/banquetData";
import { approxBudgetNumberToRange } from "@/lib/enquiryEditMapper";
import type { EventDetailRecord } from "@/lib/eventsApi";
import { mapEventToMenuEnquiryState } from "@/lib/menuSelectionMapper";
import { initialEnquiry, type EnquiryState } from "@/types/enquiry";
import { sanitizeEventDate } from "@/lib/eventDateValidation";

function matchTimeSlotPackageId(timeSlot: EventDetailRecord["timeSlot"]): string {
  if (!timeSlot) return "";
  const bySlot: Record<string, string> = {
    MORNING: "silver-morning",
    EVENING: "silver-evening",
    FULL_DAY: "silver-fullday-1",
  };
  return bySlot[timeSlot] ?? "";
}

function matchVenueId(venueName: string | null | undefined): string {
  if (!venueName) return "";
  return VENUE_OPTIONS.find((venue) => venue.name === venueName)?.id ?? "";
}

function decorIdsFromNames(names: string[]): string[] {
  return names
    .map((name) => DECOR_OPTIONS.find((option) => option.name === name)?.id)
    .filter((id): id is string => Boolean(id));
}

function decorIdsFromSpecialRequirements(specialRequirements: string | null): string[] {
  if (!specialRequirements) return [];

  const decorationLine = specialRequirements
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith("decoration:"));

  if (!decorationLine) return [];

  const names = decorationLine
    .slice("decoration:".length)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return decorIdsFromNames(names);
}

function parseSource(specialRequirements: string | null): string {
  if (!specialRequirements) return "";
  const sourceLine = specialRequirements
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith("source:"));
  return sourceLine ? sourceLine.slice("source:".length).trim() : "";
}

function formatApproxBudgetLabel(value: string | null | undefined, revenue?: number): string {
  if (value) {
    const amount = Number.parseFloat(value);
    if (Number.isFinite(amount) && amount > 0) {
      const range = approxBudgetNumberToRange(amount);
      if (range) return range;
    }
  }

  if (revenue && revenue > 0) {
    return approxBudgetNumberToRange(revenue) || `₹${revenue.toLocaleString("en-IN")}`;
  }

  return "";
}

/** Map booking + event API data into enquiry summary state for PDF generation. */
export function mapBookingToEnquiryState(
  booking: BookingRecord,
  event: EventDetailRecord,
): EnquiryState {
  const base = mapEventToMenuEnquiryState(event);
  const packageId = matchTimeSlotPackageId(event.timeSlot);
  const decorIds =
    decorIdsFromNames(booking.decorations ?? []).length > 0
      ? decorIdsFromNames(booking.decorations ?? [])
      : decorIdsFromSpecialRequirements(event.specialRequirements);

  return {
    ...initialEnquiry,
    ...base,
    basics: {
      ...base.basics,
      customerName: booking.clientName?.trim() || base.basics.customerName,
      phone: booking.phone?.trim() || base.basics.phone,
      eventType: booking.eventType || base.basics.eventType,
      eventDate: sanitizeEventDate(booking.date || event.eventDate),
      guestCount: booking.guests > 0 ? booking.guests : base.basics.guestCount,
      approxBudget: formatApproxBudgetLabel(event.approxBudget, booking.revenue),
      source: parseSource(event.specialRequirements),
    },
    packageId,
    slotId: packageId,
    venueId: matchVenueId(event.venue ?? booking.venue) || base.venueId,
    platePackageId: base.platePackageId,
    menuItemIds: event.menuItemIds ?? [],
    decorIds,
    selectMenuLater: (event.menuItemIds?.length ?? 0) === 0,
    notes: "",
    leadApiResponse: null,
  };
}

export function buildBookingPdfFilename(booking: BookingRecord): string {
  const sanitize = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  const safeName = sanitize(booking.clientName || booking.title || "Booking");
  const safeEvent = sanitize(booking.eventType || "");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return ["Booking", safeName, safeEvent, timestamp].filter(Boolean).join("_") + ".pdf";
}
