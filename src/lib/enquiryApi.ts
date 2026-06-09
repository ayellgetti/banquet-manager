import { PACKAGES, PLATE_PACKAGES, VENUE_OPTIONS } from "@/data/enquiryOptions";
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

export function buildEnquiryLeadPayload(state: EnquiryState): EnquiryLeadPayload {
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  const venue = VENUE_OPTIONS.find((v) => v.id === state.venueId);
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);

  const details: string[] = [];
  if (state.basics.source) details.push(`Source: ${state.basics.source}`);
  if (venue) details.push(`Venue: ${venue.name}`);
  if (state.notes.trim()) details.push(state.notes.trim());

  return {
    name: state.basics.customerName.trim(),
    mobileNo: state.basics.phone.trim(),
    eventDate: state.basics.eventDate,
    eventSlot: pkg?.name ?? "",
    eventMenuRange: plate?.basePrice ? String(plate.basePrice) : "",
    eventNumberOfGuest: String(state.basics.guestCount),
    eventType: state.basics.eventType,
    eventAdditionDetail: details.join("; "),
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
