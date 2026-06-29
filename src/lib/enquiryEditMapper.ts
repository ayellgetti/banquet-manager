import {
  APPROX_BUDGET_RANGES,
  DECOR_OPTIONS,
  PACKAGES,
  PLATE_PACKAGES,
  VENUE_OPTIONS,
} from "@/data/enquiryOptions";
import type { QuickEnquiryFormValues } from "@/components/enquiry/QuickEnquiryForm";
import { formatCustomerName, parseApproxBudgetRange, splitCustomerName } from "@/lib/mappers/enquiryMapper";
import { sanitizeEventDate } from "@/lib/eventDateValidation";

type ApiEnquiryDetail = {
  id: string;
  customerId: string;
  leadSource: string | null;
  remarks: string | null;
  customer: {
    firstName: string;
    lastName: string;
    mobileNo: string;
  };
};

type ApiEventDetail = {
  id: string;
  eventType: string;
  eventDate: string;
  timeSlot: "MORNING" | "EVENING" | "FULL_DAY" | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  approxBudget: string | null;
  decorationRequired: boolean;
  specialRequirements: string | null;
};

function matchTimeSlotId(timeSlot: ApiEventDetail["timeSlot"]): string {
  if (!timeSlot) return "";
  const bySlot: Record<string, string> = {
    MORNING: "silver-morning",
    EVENING: "silver-evening",
    FULL_DAY: "silver-fullday-1",
  };
  return bySlot[timeSlot] ?? "";
}

function matchVenueId(venueName: string | null): string {
  if (!venueName) return "";
  return VENUE_OPTIONS.find((venue) => venue.name === venueName)?.id ?? "";
}

export function matchMenuPackageId(menuLabel: string | null): string {
  if (!menuLabel) return "";
  const normalized = menuLabel.toLowerCase();
  const match = PLATE_PACKAGES.find(
    (pkg) =>
      normalized.startsWith(pkg.name.toLowerCase()) ||
      normalized.includes(`₹${pkg.basePrice}`) ||
      normalized.includes(`rs.${pkg.basePrice}`),
  );
  return match?.id ?? "";
}

export function approxBudgetNumberToRange(budget: number): string {
  if (budget <= 0) return "";

  let best = "";
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const range of APPROX_BUDGET_RANGES) {
    const midpoint = parseApproxBudgetRange(range);
    if (midpoint === null) continue;
    const diff = Math.abs(midpoint - budget);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = range;
    }
  }

  return best;
}

function parseDecorationIds(specialRequirements: string | null, decorationRequired: boolean): string[] {
  if (!specialRequirements && !decorationRequired) return [];

  const decorationLine = specialRequirements
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().startsWith("decoration:"));

  if (!decorationLine) return [];

  const names = decorationLine
    .slice("decoration:".length)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return DECOR_OPTIONS.filter((option) => names.includes(option.name)).map((option) => option.id);
}

export function mapEnquiryDetailToFormValues(
  enquiry: ApiEnquiryDetail,
  event?: ApiEventDetail | null,
): QuickEnquiryFormValues {
  const clientName = formatCustomerName(enquiry.customer.firstName, enquiry.customer.lastName);
  const budget = event?.approxBudget ? Number.parseFloat(event.approxBudget) : 0;

  return {
    customerName: clientName,
    phone: enquiry.customer.mobileNo,
    eventType: event?.eventType ?? "",
    eventDate: sanitizeEventDate(event?.eventDate),
    timeSlotId: event ? matchTimeSlotId(event.timeSlot) : "",
    guestCount: event?.guestCount && event.guestCount > 0 ? event.guestCount : 100,
    venueId: matchVenueId(event?.venue ?? null),
    source: enquiry.leadSource ?? "",
    approxBudget: event?.approxBudget ? approxBudgetNumberToRange(budget) : "",
    menuPackageId: matchMenuPackageId(event?.menuPackage ?? null),
    decorationIds: parseDecorationIds(event?.specialRequirements ?? null, event?.decorationRequired ?? false),
  };
}

export type EnquiryEditContext = {
  enquiryId: string;
  customerId: string;
  eventId?: string;
};

export function buildEnquiryUpdatePayload(
  context: EnquiryEditContext,
  form: QuickEnquiryFormValues,
  options: {
    timeSlot: ReturnType<typeof import("@/lib/mappers/enquiryMapper").mapTimeSlotLabelToEnum>;
    venueName: string;
    menuLabel: string;
    decorationNames: string[];
    approxBudget: number | null;
  },
) {
  const { firstName, lastName } = splitCustomerName(form.customerName);

  const customerBody = {
    firstName,
    lastName,
    mobileNo: form.phone.trim(),
  };

  const enquiryBody = {
    leadSource: form.source.trim() || null,
    remarks: enquiryRemarksFromForm(form, options),
  };

  const eventBody = {
    eventType: form.eventType,
    eventDate: form.eventDate,
    timeSlot: options.timeSlot,
    guestCount: form.guestCount,
    venue: options.venueName || null,
    menuPackage: options.menuLabel || null,
    approxBudget: options.approxBudget,
    decorationRequired: options.decorationNames.length > 0,
    specialRequirements: buildSpecialRequirements(form, options),
  };

  return { customerBody, enquiryBody, eventBody };
}

function enquiryRemarksFromForm(
  form: QuickEnquiryFormValues,
  options: { decorationNames: string[] },
): string | null {
  const parts = [
    form.approxBudget ? `Approx budget: ${form.approxBudget}` : "",
    options.decorationNames.length ? `Decoration: ${options.decorationNames.join(", ")}` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("\n") : null;
}

function buildSpecialRequirements(
  form: QuickEnquiryFormValues,
  options: { venueName: string; decorationNames: string[] },
): string | null {
  const parts = [
    options.venueName ? `Venue: ${options.venueName}` : "",
    form.source ? `Source: ${form.source}` : "",
    form.approxBudget ? `Approx budget: ${form.approxBudget}` : "",
    options.decorationNames.length ? `Decoration: ${options.decorationNames.join(", ")}` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("\n") : null;
}
