import {
  PACKAGES,
  MENU_ITEMS,
  PLATE_PACKAGES,
  VENUE_OPTIONS,
} from "@/data/enquiryOptions";
import type { EnquiryState } from "@/types/enquiry";

export const ENQUIRY_API_URL =
  import.meta.env.VITE_ENQUIRY_API_URL ??
  "https://script.google.com/macros/s/AKfycbweikk2xl_uqoJRT3mIHBCRLa8ybug9M1pObhH12quNB4WuZbMGn_WbdSCBvA13et5Z/exec";

export type EnquiryLeadPayload = {
  name: string;
  mobileNo: string;
  eventDate: string;
  eventSlot: string;
  eventMenuRange: string;
  eventNumberOfGuest: string;
  eventType: string;
  eventAdditionDetail: string;
};

export type EnquiryApiResponse = {
  success?: boolean;
  [key: string]: unknown;
};


function formatEventSlot(state: EnquiryState): string {
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  if (!pkg) return "";
  const slot = pkg.slots?.find((sl) => sl.id === state.slotId) || pkg.slots?.[0];
  return slot?.label ?? pkg.name;
}

function formatMenuSelections(state: EnquiryState): string[] {
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  if (!plate) return [];

  const lines: string[] = [];
  if (plate.basePrice > 0) {
    lines.push(`Plate Package: ${plate.name} (₹${plate.basePrice}/plate)`);
  } else {
    lines.push(`Plate Package: ${plate.name}`);
  }

  if (state.selectMenuLater) {
    lines.push("Dishes: To be selected later");
    return lines;
  }

  const selected = MENU_ITEMS.filter((m) => state.menuItemIds.includes(m.id));
  if (selected.length === 0) {
    lines.push("Dishes: None selected yet");
    return lines;
  }

  const byCat: Record<string, typeof MENU_ITEMS> = {};
  selected.forEach((m) => {
    (byCat[m.category] ||= []).push(m);
  });

  lines.push("Selected Dishes:");
  for (const [cat, items] of Object.entries(byCat)) {
    const limit = (plate.limits as Record<string, number>)[cat] ?? 0;
    const sorted = [...items].sort((a, b) => a.price - b.price);
    const includedIds = new Set(sorted.slice(0, limit).map((m) => m.id));
    const dishLabels = items.map((m) => {
      const isExtra = limit > 0 && !includedIds.has(m.id);
      const isCustom = limit === 0 && m.price > 0;
      if (isExtra || isCustom) return `${m.name} (+₹${m.price}/plate)`;
      return m.name;
    });
    lines.push(`  ${cat}: ${dishLabels.join(", ")}`);
  }

  return lines;
}

function buildAdditionDetail(state: EnquiryState): string {
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  const venue = VENUE_OPTIONS.find((v) => v.id === state.venueId);

  const sections: string[] = [];

  if (state.basics.source) sections.push(`Source: ${state.basics.source}`);
  if (venue) sections.push(`Venue: ${venue.name}${venue.description ? ` — ${venue.description}` : ""}`);

  if (pkg) {
    const slotLabel = formatEventSlot(state);
    const slot = pkg.slots?.find((sl) => sl.id === state.slotId) || pkg.slots?.[0];
    sections.push(
      slot
        ? `Time Slot: ${slotLabel}${slot.hours ? ` (${slot.hours}h)` : ""}`
        : `Time Slot: ${slotLabel}`,
    );
  }

  sections.push(...formatMenuSelections(state));

  return sections.join("\n");
}

export function buildEnquiryLeadPayload(state: EnquiryState): EnquiryLeadPayload {
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);

  let eventMenuRange = "";
  if (plate?.basePrice) {
    eventMenuRange = String(plate.basePrice);
  } else if (plate) {
    eventMenuRange = plate.name;
  }

  return {
    name: state.basics.customerName.trim(),
    mobileNo: state.basics.phone.trim(),
    eventDate: state.basics.eventDate,
    eventSlot: formatEventSlot(state),
    eventMenuRange,
    eventNumberOfGuest: String(state.basics.guestCount),
    eventType: state.basics.eventType,
    eventAdditionDetail: buildAdditionDetail(state),
  };
}

export async function submitEnquiryLead(payload: EnquiryLeadPayload): Promise<EnquiryApiResponse> {
  // Use text/plain (not application/json) so the browser sends a "simple" POST
  // without a CORS preflight. GAS reads JSON from e.postData.contents regardless.
  const res = await fetch(ENQUIRY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  let data: EnquiryApiResponse;
  try {
    data = (await res.json()) as EnquiryApiResponse;
  } catch {
    throw new Error("Invalid response from enquiry service");
  }

  if (!res.ok || data.success === false) {
    throw new Error(typeof data.message === "string" ? data.message : "Enquiry submission failed");
  }

  return data;
}
