import { APPROX_BUDGET_RANGES, PACKAGES } from "@/data/enquiryOptions";
import type { EnquiryLeadPayload } from "@/lib/enquiryApi";

export type CrmLeadPayload = {
  firstName: string;
  lastName: string;
  mobileNo: string;
  eventType: string;
  eventDate: string;
  timeSlot?: "MORNING" | "EVENING" | "FULL_DAY" | null;
  guestCount?: number | null;
  venue?: string | null;
  menuPackage?: string | null;
  leadSource?: string | null;
  approxBudget?: number | null;
  decorationRequired?: boolean;
  specialRequirements?: string | null;
  remarks?: string | null;
};

export function splitCustomerName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: "Guest", lastName: "Customer" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "." };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

/** Display name from API first/last fields (strips placeholder "." last names). */
export function formatCustomerName(firstName: string, lastName?: string | null): string {
  const first = firstName.trim();
  const last = (lastName ?? "").trim();
  if (!last || last === ".") {
    return first;
  }
  return `${first} ${last}`.trim();
}

export function buildBookingTitle(enquiry: { clientName?: string; phone?: string; eventType: string }): string {
  const name = enquiry.clientName?.trim() || enquiry.phone?.trim();
  return name ? `${name} — ${enquiry.eventType}` : enquiry.eventType;
}

export function getEnquiryCustomerName(enquiry: { clientName?: string; phone?: string }): string {
  return enquiry.clientName?.trim() || enquiry.phone?.trim() || "";
}

export function normalizeMobileNo(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function mapTimeSlotLabelToEnum(
  label: string,
  packageId?: string,
): "MORNING" | "EVENING" | "FULL_DAY" | null {
  if (packageId) {
    if (packageId.includes("morning")) return "MORNING";
    if (packageId.includes("evening")) return "EVENING";
    if (packageId.includes("fullday")) return "FULL_DAY";
  }

  const lower = label.toLowerCase();
  if (lower.includes("morning")) return "MORNING";
  if (lower.includes("evening")) return "EVENING";
  if (lower.includes("full day") || lower.includes("fullday")) return "FULL_DAY";

  const pkg = PACKAGES.find((item) => item.id === packageId);
  if (pkg?.name.toLowerCase().includes("morning")) return "MORNING";
  if (pkg?.name.toLowerCase().includes("evening")) return "EVENING";
  if (pkg?.name.toLowerCase().includes("full day")) return "FULL_DAY";

  return null;
}

export function parseApproxBudgetRange(range?: string): number | null {
  if (!range?.trim()) return null;

  const normalized = range.trim().toLowerCase();
  if (normalized.includes("more than 5")) return 600000;
  if (normalized.includes("4lac - 5lac")) return 450000;
  if (normalized.includes("3lac - 4lac")) return 350000;
  if (normalized.includes("2lac - 3lac")) return 250000;
  if (normalized.includes("1lac - 2lac")) return 150000;
  if (normalized.includes("50k - 1lac")) return 75000;
  if (normalized.includes("1k - 50k")) return 25000;

  const match = APPROX_BUDGET_RANGES.find((item) => item.toLowerCase() === normalized);
  if (!match) return null;
  return parseApproxBudgetRange(match);
}

function extractLineValue(text: string, prefix: string): string | null {
  const line = text
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!line) return null;
  return line.slice(prefix.length).trim() || null;
}

export function mapEnquiryLeadPayloadToCrm(payload: EnquiryLeadPayload): CrmLeadPayload {
  const { firstName, lastName } = splitCustomerName(payload.name);
  const guestCount = Number.parseInt(payload.eventNumberOfGuest, 10);

  const venue = extractLineValue(payload.eventAdditionDetail, "Venue:");
  const source = extractLineValue(payload.eventAdditionDetail, "Source:");
  const approxBudgetLabel = extractLineValue(payload.eventAdditionDetail, "Approx budget:");
  const decorationLine = extractLineValue(payload.eventAdditionDetail, "Decoration:");
  const moduleLine = extractLineValue(payload.eventAdditionDetail, "Module:");

  return {
    firstName,
    lastName,
    mobileNo: normalizeMobileNo(payload.mobileNo),
    eventType: payload.eventType,
    eventDate: payload.eventDate,
    timeSlot: mapTimeSlotLabelToEnum(payload.eventSlot),
    guestCount: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
    venue,
    menuPackage: payload.eventMenuRange || null,
    leadSource: source,
    approxBudget: parseApproxBudgetRange(approxBudgetLabel ?? undefined),
    decorationRequired: Boolean(decorationLine),
    specialRequirements: payload.eventAdditionDetail || null,
    remarks: moduleLine ? `Submitted via ${moduleLine}` : null,
  };
}

export type QuickEnquiryCrmInput = {
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlotId: string;
  timeSlotLabel: string;
  guestCount: number;
  venueName: string;
  source: string;
  approxBudget?: string;
  menuPackageLabel: string;
  decorationNames: string[];
};

export function mapQuickEnquiryToCrm(input: QuickEnquiryCrmInput): CrmLeadPayload {
  const { firstName, lastName } = splitCustomerName(input.customerName);
  const remarkParts = [
    input.approxBudget ? `Approx budget: ${input.approxBudget}` : "",
    input.decorationNames.length ? `Decoration: ${input.decorationNames.join(", ")}` : "",
  ].filter(Boolean);

  return {
    firstName,
    lastName,
    mobileNo: normalizeMobileNo(input.phone),
    eventType: input.eventType,
    eventDate: input.eventDate,
    timeSlot: mapTimeSlotLabelToEnum(input.timeSlotLabel, input.timeSlotId),
    guestCount: input.guestCount,
    venue: input.venueName.trim() || null,
    menuPackage: input.menuPackageLabel.trim() || null,
    leadSource: input.source,
    approxBudget: parseApproxBudgetRange(input.approxBudget),
    decorationRequired: input.decorationNames.length > 0,
    specialRequirements: [
      input.venueName ? `Venue: ${input.venueName}` : "",
      input.source ? `Source: ${input.source}` : "",
      input.approxBudget ? `Approx budget: ${input.approxBudget}` : "",
      input.decorationNames.length ? `Decoration: ${input.decorationNames.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n") || null,
    remarks: remarkParts.length > 0 ? remarkParts.join("\n") : null,
  };
}
