import rawData from "./dummy-banquet-data.json";
import type { BanquetDummyData, BookingLogEntry, EnquiryLogEntry, EnquiryStatus, FollowUpLogEntry, InventoryLogEntry, PaymentLogEntry, VendorLogEntry } from "./banquetData";

/** In-memory store — simulates server state until a real API exists. */
const clone = (): BanquetDummyData => structuredClone(rawData as BanquetDummyData);

let store: BanquetDummyData = clone();

if (!store.followUps) {
  store.followUps = [];
}
if (!store.payments) {
  store.payments = [];
}
if (!store.vendors) {
  store.vendors = [];
}
if (!store.inventory) {
  store.inventory = [];
}

export function getMutablePayments(): PaymentLogEntry[] {
  return store.payments;
}

export function getMutableVendors(): VendorLogEntry[] {
  return store.vendors;
}

export function getMutableInventory(): InventoryLogEntry[] {
  return store.inventory;
}

export function getBanquetStore(): BanquetDummyData {
  return store;
}

export function resetBanquetStore(): void {
  store = clone();
}

export function getMutableEnquiries(): EnquiryLogEntry[] {
  return store.enquiries;
}

export function getMutableBookings(): BookingLogEntry[] {
  return store.bookings;
}

export function toggleBookingRequirement(bookingId: string, requirementId: string): boolean {
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking?.requirements) return false;
  const requirement = booking.requirements.find((r) => r.id === requirementId);
  if (!requirement) return false;
  requirement.done = !requirement.done;
  return requirement.done;
}

export function getMutableFollowUps(): FollowUpLogEntry[] {
  return store.followUps;
}

export type LogFollowUpInput = {
  enquiryId: string;
  comment: string;
  status: EnquiryStatus;
  nextFollowUpDate?: string;
};

export function logFollowUp(input: LogFollowUpInput): FollowUpLogEntry {
  const enquiry = store.enquiries.find((e) => e.id === input.enquiryId);
  if (!enquiry) throw new Error("Enquiry not found");
  if (enquiry.status === "booked") throw new Error("Cannot follow up on a booked enquiry");
  if (!input.comment.trim()) throw new Error("Comment is required");

  const previousStatus = enquiry.status;
  const entry: FollowUpLogEntry = {
    id: `fu-${Date.now()}`,
    enquiryId: input.enquiryId,
    comment: input.comment.trim(),
    status: input.status,
    previousStatus,
    nextFollowUpDate: input.nextFollowUpDate,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  enquiry.status = input.status;
  enquiry.nextFollowUpDate = input.nextFollowUpDate;
  store.followUps.push(entry);
  return entry;
}

export function getOpenEnquiries(): EnquiryLogEntry[] {
  return store.enquiries.filter(
    (enquiry) => enquiry.status !== "booked" && !store.bookings.some((b) => b.enquiryId === enquiry.id),
  );
}

export type ConvertEnquiryInput = {
  enquiryId: string;
  title: string;
  eventType: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  category: BookingLogEntry["category"];
  status: BookingLogEntry["status"];
  guests: number;
  revenue?: number;
  menuPackage?: string;
  platePackageId?: string;
};

export function convertEnquiryToBooking(input: ConvertEnquiryInput): BookingLogEntry {
  const enquiry = store.enquiries.find((e) => e.id === input.enquiryId);
  if (!enquiry) throw new Error("Enquiry not found");
  if (enquiry.status === "booked") throw new Error("Enquiry already booked");
  if (store.bookings.some((b) => b.enquiryId === input.enquiryId)) {
    throw new Error("Enquiry already converted");
  }

  const booking: BookingLogEntry = {
    id: `bkg-${Date.now()}`,
    customerId: enquiry.customerId,
    enquiryId: input.enquiryId,
    title: input.title,
    eventType: input.eventType,
    date: input.date,
    time: input.time,
    endTime: input.endTime,
    venue: input.venue,
    category: input.category,
    status: input.status,
    guests: input.guests,
    revenue: input.revenue ?? enquiry.budget,
    menuPackage: input.menuPackage,
    decorations: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };

  enquiry.status = "booked";
  store.bookings.push(booking);
  return booking;
}
