import {
  fetchEnquiriesFromApi,
  fetchEnquiryViewDetailFromApi,
  fetchOpenEnquiriesFromApi,
} from "@/lib/enquiriesApi";
import { fetchBookingsFromApi, convertEnquiryToBookingViaApi } from "@/lib/bookingsApi";
import { fetchCustomersFromApi } from "@/lib/customersApi";
import { fetchAllCalendarEventsFromApi } from "@/lib/eventsApi";
import {
  fetchFollowUpEnquiriesFromApi,
  fetchFollowUpHistoryFromApi,
  logFollowUpViaApi,
} from "@/lib/followupsApi";
import { fetchInventoryFromApi, fetchVendorsFromApi } from "@/lib/catalogApi";
import {
  createInventoryOrderViaApi,
  fetchInventoryOrderByIdFromApi,
  fetchInventoryOrdersFromApi,
  type CreateInventoryOrderInput,
} from "@/lib/inventoryOrdersApi";
import { fetchPaymentsFromApi, createPaymentViaApi, type CreatePaymentInput } from "@/lib/paymentsApi";
import {
  createInvoiceViaApi,
  fetchInvoiceByIdFromApi,
  fetchInvoicesFromApi,
  updateInvoiceViaApi,
  type CreateInvoiceInput,
  type InvoiceListRecord,
  type UpdateInvoiceInput,
} from "@/lib/invoicesApi";
import { format } from "date-fns";
import {
  type ConvertEnquiryInput,
  type LogFollowUpInput,
} from "@/data/banquetStore";
import {
  getCalendarStats,
  getUpcomingEvents,
  type BanquetDummyData,
  type BookingRecord,
  type CalendarEvent,
  type CustomerListRecord,
  type EnquiryRecord,
  type FollowUpEnquiryRecord,
  type FollowUpLogEntry,
  type InventoryRecord,
  type PaymentRecord,
  type VendorRecord,
} from "@/data/banquetData";

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

export const banquetQueryKeys = {
  all: ["banquet"] as const,
  customers: () => [...banquetQueryKeys.all, "customers"] as const,
  enquiries: () => [...banquetQueryKeys.all, "enquiries"] as const,
  enquiryDetail: (enquiryId: string) => [...banquetQueryKeys.all, "enquiries", "detail", enquiryId] as const,
  openEnquiries: () => [...banquetQueryKeys.all, "enquiries", "open"] as const,
  followUpEnquiries: () => [...banquetQueryKeys.all, "follow-up", "enquiries"] as const,
  followUpHistory: (enquiryId: string) => [...banquetQueryKeys.all, "follow-up", "history", enquiryId] as const,
  bookings: () => [...banquetQueryKeys.all, "bookings"] as const,
  payments: () => [...banquetQueryKeys.all, "payments"] as const,
  invoices: () => [...banquetQueryKeys.all, "invoices"] as const,
  invoiceDetail: (invoiceId: string) => [...banquetQueryKeys.all, "invoices", "detail", invoiceId] as const,
  vendors: () => [...banquetQueryKeys.all, "vendors"] as const,
  inventory: () => [...banquetQueryKeys.all, "inventory"] as const,
  inventoryOrders: () => [...banquetQueryKeys.all, "inventory-orders"] as const,
  inventoryOrderDetail: (orderId: string) =>
    [...banquetQueryKeys.all, "inventory-orders", "detail", orderId] as const,
  calendarEvents: () => [...banquetQueryKeys.all, "calendar", "events"] as const,
  calendarOverview: (monthKey: string) => [...banquetQueryKeys.all, "calendar", "overview", monthKey] as const,
};

/** Legacy aggregate payload — returns empty structure; use entity API hooks instead. */
export async function fetchBanquetData(): Promise<ApiResponse<BanquetDummyData>> {
  return {
    success: true,
    data: {
      customers: [],
      enquiries: [],
      bookings: [],
      followUps: [],
      payments: [],
      vendors: [],
      inventory: [],
    },
  };
}

/** GET /api/customers */
export async function fetchCustomers(): Promise<ApiResponse<CustomerListRecord[]>> {
  return { success: true, data: await fetchCustomersFromApi() };
}

/** GET /enquiries — pipeline rows with customer joined. */
export async function fetchEnquiries(): Promise<ApiResponse<EnquiryRecord[]>> {
  return { success: true, data: await fetchEnquiriesFromApi() };
}

/** Open enquiries available for conversion to booking. */
export async function fetchOpenEnquiries(): Promise<ApiResponse<EnquiryRecord[]>> {
  return { success: true, data: await fetchOpenEnquiriesFromApi() };
}

/** GET /enquiries/:id — full enquiry detail for read-only view. */
export async function fetchEnquiryViewDetail(enquiryId: string) {
  return { success: true as const, data: await fetchEnquiryViewDetailFromApi(enquiryId) };
}

/** GET /api/bookings */
export async function fetchBookings(): Promise<ApiResponse<BookingRecord[]>> {
  return { success: true, data: await fetchBookingsFromApi() };
}

/** GET /api/calendar/events */
export async function fetchCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
  return { success: true, data: await fetchAllCalendarEventsFromApi() };
}

/** GET /api/calendar/overview?month=YYYY-MM */
export async function fetchCalendarOverview(month = new Date()): Promise<ApiResponse<CalendarOverview>> {
  const events = await fetchAllCalendarEventsFromApi();
  return {
    success: true,
    data: {
      events,
      upcoming: getUpcomingEvents(events),
      stats: getCalendarStats(events, month),
    },
  };
}

export function getMonthKey(month: Date) {
  return format(month, "yyyy-MM");
}

/** GET /api/follow-up/enquiries */
export async function fetchFollowUpEnquiries(): Promise<ApiResponse<FollowUpEnquiryRecord[]>> {
  return { success: true, data: await fetchFollowUpEnquiriesFromApi() };
}

/** GET /api/follow-up/history?enquiryId= */
export async function fetchFollowUpHistory(enquiryId: string): Promise<ApiResponse<FollowUpLogEntry[]>> {
  return { success: true, data: await fetchFollowUpHistoryFromApi(enquiryId) };
}

/** POST /api/follow-up/log */
export async function postLogFollowUp(input: LogFollowUpInput): Promise<ApiResponse<FollowUpLogEntry>> {
  return { success: true, data: await logFollowUpViaApi(input) };
}

/** GET /api/payments */
export async function fetchPayments(): Promise<ApiResponse<PaymentRecord[]>> {
  return { success: true, data: await fetchPaymentsFromApi() };
}

/** POST /payments — record income payment */
export async function createPayment(input: CreatePaymentInput): Promise<ApiResponse<PaymentRecord>> {
  return { success: true, data: await createPaymentViaApi(input) };
}

/** GET /invoices */
export async function fetchInvoices(): Promise<ApiResponse<InvoiceListRecord[]>> {
  return { success: true, data: await fetchInvoicesFromApi() };
}

/** GET /invoices/:id */
export async function fetchInvoiceDetail(invoiceId: string) {
  return { success: true as const, data: await fetchInvoiceByIdFromApi(invoiceId) };
}

/** POST /invoices */
export async function createInvoice(input: CreateInvoiceInput) {
  return { success: true as const, data: await createInvoiceViaApi(input) };
}

/** PATCH /invoices/:id */
export async function updateInvoice(invoiceId: string, input: UpdateInvoiceInput) {
  return { success: true as const, data: await updateInvoiceViaApi(invoiceId, input) };
}

/** GET /api/vendors */
export async function fetchVendors(): Promise<ApiResponse<VendorRecord[]>> {
  return { success: true, data: await fetchVendorsFromApi() };
}

/** GET /api/inventory */
export async function fetchInventory(): Promise<ApiResponse<InventoryRecord[]>> {
  return { success: true, data: await fetchInventoryFromApi() };
}

/** GET /inventory-orders */
export async function fetchInventoryOrders() {
  return { success: true as const, data: await fetchInventoryOrdersFromApi() };
}

/** GET /inventory-orders/:id */
export async function fetchInventoryOrder(orderId: string) {
  return { success: true as const, data: await fetchInventoryOrderByIdFromApi(orderId) };
}

/** POST /inventory-orders */
export async function createInventoryOrder(input: CreateInventoryOrderInput) {
  return { success: true as const, data: await createInventoryOrderViaApi(input) };
}

export type ConvertEnquiryPayload = Omit<ConvertEnquiryInput, "category"> & {
  eventType: string;
};

/** POST /api/bookings/convert — enquiry → booking */
export async function convertEnquiryToBooking(
  payload: ConvertEnquiryPayload,
): Promise<ApiResponse<BookingRecord>> {
  return { success: true, data: await convertEnquiryToBookingViaApi(payload) };
}
