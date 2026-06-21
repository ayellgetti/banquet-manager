import {
  PACKAGES,
  PLATE_PACKAGES,
  VENUE_OPTIONS,
} from "@/data/enquiryOptions";
import type { EnquiryState } from "@/types/enquiry";
import { formatINR } from "@/lib/enquiryTotals";

export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "919930413300";

const formatEventDate = (iso: string): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const formatTimeSlot = (state: EnquiryState): string => {
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  if (!pkg) return "";
  const slot = pkg.slots?.find((sl) => sl.id === state.slotId) || pkg.slots?.[0];
  return slot?.label ?? pkg.name;
};

const formatVenue = (state: EnquiryState): string => {
  const venue = VENUE_OPTIONS.find((v) => v.id === state.venueId);
  return venue?.name || "—";
};

const formatSpecialRequest = (raw: string): string => {
  const plain = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
  return plain || "—";
};

const formatPreferredPackage = (state: EnquiryState): string => {
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  if (!plate) return "—";
  if (plate.basePrice > 0) {
    return `${plate.name} (${formatINR(plate.basePrice)}/plate)`;
  }
  return plate.name;
};

export function buildEnquiryWhatsAppMessage(state: EnquiryState): string {
  const b = state.basics;

  const lines = [
    "*New Enquiry*",
    "",
    `👤 Name: ${b.customerName.trim() || "—"}`,
    `📱 Mobile Number: ${b.phone.trim() || "—"}`,
    `📅 Event Date: ${formatEventDate(b.eventDate)}`,
    `🎉 Event Type: ${b.eventType || "—"}`,
    `👥 Expected Guest Count: ${b.guestCount || "—"}`,
    `🍽 Preferred Package (if any): ${formatPreferredPackage(state)}`,
    `💵 Approximate Budget: ${b.approxBudget || "—"}`,
    `📍 Venue: ${formatVenue(state)}`,
    `⏰ Time Slot: ${formatTimeSlot(state) || "—"}`,
  ];

  if (b.source) {
    lines.push(`📋 Source: ${b.source}`);
  }

  const specialRequest = formatSpecialRequest(state.notes);
  lines.push(
    specialRequest === "—"
      ? "💬 Any special request: —"
      : `💬 Any special request:\n${specialRequest}`,
  );

  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function openEnquiryWhatsApp(state: EnquiryState, phone = WHATSAPP_NUMBER): boolean {
  if (!phone) return false;
  const url = buildWhatsAppUrl(phone, buildEnquiryWhatsAppMessage(state));
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
