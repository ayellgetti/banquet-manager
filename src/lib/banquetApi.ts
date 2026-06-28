import { format } from "date-fns";
import {
  convertEnquiryToBooking as storeConvertEnquiry,
  getBanquetStore,
  getOpenEnquiries,
  logFollowUp as storeLogFollowUp,
  type ConvertEnquiryInput,
  type LogFollowUpInput,
} from "@/data/banquetStore";
import {
  getCalendarEvents,
  getCalendarStats,
  getFollowUpsForEnquiry,
  getUpcomingEvents,
  inferEventCategory,
  toBookingRecords,
  toCustomerRecords,
  toEnquiryRecords,
  toInventoryRecords,
  toFollowUpEnquiryRecords,
  toPaymentRecords,
  toVendorRecords,
  type BanquetDummyData,
  type BookingRecord,
  type CalendarEvent,
  type CustomerRecord,
  type CustomerListRecord,
  type EnquiryRecord,
  type FollowUpEnquiryRecord,
  type FollowUpLogEntry,
  type InventoryRecord,
  type PaymentRecord,
  type VendorRecord,
} from "@/data/banquetData";

const API_DELAY_MS = 350;

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type CalendarOverview = {
  events: CalendarEvent[];
  upcoming: CalendarEvent[];
  stats: {
    upcoming: number;
    confirmedThisMonth: number;
    revenue: number;
  };
};

function delay(ms = API_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function asApiResponse<T>(data: T): Promise<ApiResponse<T>> {
  await delay();
  return { success: true, data };
}

/** Simulates GET /api/banquet — full dummy JSON payload. */
export async function fetchBanquetData(): Promise<ApiResponse<BanquetDummyData>> {
  return asApiResponse(getBanquetStore());
}

/** Simulates GET /api/customers */
export async function fetchCustomers(): Promise<ApiResponse<CustomerListRecord[]>> {
  return asApiResponse(toCustomerRecords());
}

/** Simulates GET /api/enquiries — pipeline rows with customer joined. */
export async function fetchEnquiries(): Promise<ApiResponse<EnquiryRecord[]>> {
  return asApiResponse(toEnquiryRecords());
}

/** Open enquiries available for conversion to booking. */
export async function fetchOpenEnquiries(): Promise<ApiResponse<EnquiryRecord[]>> {
  const openIds = new Set(getOpenEnquiries().map((e) => e.id));
  const records = toEnquiryRecords().filter((e) => openIds.has(e.id));
  return asApiResponse(records);
}

/** Simulates GET /api/bookings — booking log rows with customer joined. */
export async function fetchBookings(): Promise<ApiResponse<BookingRecord[]>> {
  return asApiResponse(toBookingRecords());
}

/** Simulates GET /api/calendar/events */
export async function fetchCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
  return asApiResponse(getCalendarEvents());
}

/** Simulates GET /api/calendar/overview?month=YYYY-MM */
export async function fetchCalendarOverview(month = new Date()): Promise<ApiResponse<CalendarOverview>> {
  await delay();
  const events = getCalendarEvents();
  return {
    success: true,
    data: {
      events,
      upcoming: getUpcomingEvents(events),
      stats: getCalendarStats(events, month),
    },
  };
}

export const banquetQueryKeys = {
  all: ["banquet"] as const,
  customers: () => [...banquetQueryKeys.all, "customers"] as const,
  enquiries: () => [...banquetQueryKeys.all, "enquiries"] as const,
  openEnquiries: () => [...banquetQueryKeys.all, "enquiries", "open"] as const,
  followUpEnquiries: () => [...banquetQueryKeys.all, "follow-up", "enquiries"] as const,
  followUpHistory: (enquiryId: string) => [...banquetQueryKeys.all, "follow-up", "history", enquiryId] as const,
  bookings: () => [...banquetQueryKeys.all, "bookings"] as const,
  payments: () => [...banquetQueryKeys.all, "payments"] as const,
  vendors: () => [...banquetQueryKeys.all, "vendors"] as const,
  inventory: () => [...banquetQueryKeys.all, "inventory"] as const,
  calendarEvents: () => [...banquetQueryKeys.all, "calendar", "events"] as const,
  calendarOverview: (monthKey: string) => [...banquetQueryKeys.all, "calendar", "overview", monthKey] as const,
};

export function getMonthKey(month: Date) {
  return format(month, "yyyy-MM");
}

/** Simulates GET /api/follow-up/enquiries */
export async function fetchFollowUpEnquiries(): Promise<ApiResponse<FollowUpEnquiryRecord[]>> {
  return asApiResponse(toFollowUpEnquiryRecords());
}

/** Simulates GET /api/follow-up/history?enquiryId= */
export async function fetchFollowUpHistory(enquiryId: string): Promise<ApiResponse<FollowUpLogEntry[]>> {
  return asApiResponse(getFollowUpsForEnquiry(enquiryId));
}

/** Simulates POST /api/follow-up/log */
export async function postLogFollowUp(input: LogFollowUpInput): Promise<ApiResponse<FollowUpLogEntry>> {
  await delay();
  return { success: true, data: storeLogFollowUp(input) };
}

/** Simulates GET /api/payments */
export async function fetchPayments(): Promise<ApiResponse<PaymentRecord[]>> {
  return asApiResponse(toPaymentRecords());
}

/** Simulates GET /api/vendors */
export async function fetchVendors(): Promise<ApiResponse<VendorRecord[]>> {
  return asApiResponse(toVendorRecords());
}

/** Simulates GET /api/inventory */
export async function fetchInventory(): Promise<ApiResponse<InventoryRecord[]>> {
  return asApiResponse(toInventoryRecords());
}

export type ConvertEnquiryPayload = Omit<ConvertEnquiryInput, "category"> & {
  eventType: string;
};

/** Simulates POST /api/bookings/convert — enquiry → booking, status → booked. */
export async function convertEnquiryToBooking(
  payload: ConvertEnquiryPayload,
): Promise<ApiResponse<BookingRecord>> {
  await delay();
  const booking = storeConvertEnquiry({
    ...payload,
    category: inferEventCategory(payload.eventType),
  });
  const record = toBookingRecords().find((b) => b.id === booking.id);
  if (!record) throw new Error("Booking not found after convert");
  return { success: true, data: record };
}
