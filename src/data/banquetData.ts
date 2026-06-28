import { format } from "date-fns";
import rawData from "./dummy-banquet-data.json";
import { getBanquetStore, getMutableBookings, getMutableEnquiries } from "./banquetStore";

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
};

export type CustomerSegment = EventCategory | "lead";

export type CustomerListRecord = CustomerRecord & {
  segment: CustomerSegment;
  enquiryCount: number;
  bookingCount: number;
  totalSpent: number;
};

export type EnquiryStatus = "new" | "contacted" | "qualified" | "booked";

export type EnquiryLogEntry = {
  id: string;
  customerId: string;
  eventType: string;
  preferredDate: string;
  guests: number;
  budget: number;
  status: EnquiryStatus;
  note?: string;
  source?: string;
  createdAt: string;
  nextFollowUpDate?: string;
};

export type FollowUpLogEntry = {
  id: string;
  enquiryId: string;
  comment: string;
  status: EnquiryStatus;
  previousStatus: EnquiryStatus;
  nextFollowUpDate?: string;
  createdAt: string;
};

export type BookingStatus = "confirmed" | "tentative" | "cancelled";
export type EventCategory = "wedding" | "corporate" | "private";
export type BookingDisplayStatus = "completed" | "confirmed" | "tentative" | "cancelled";

export type BookingRequirement = {
  id: string;
  label: string;
  done: boolean;
};

export type BookingVendor = {
  id: string;
  vendorId?: string;
  name: string;
  category: string;
  contact: string;
  rating: number;
  rate: number;
};

export type BookingLogEntry = {
  id: string;
  customerId: string;
  enquiryId: string;
  title: string;
  eventType: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  category: EventCategory;
  status: BookingStatus;
  guests: number;
  revenue?: number;
  menuPackage?: string;
  decorations?: string[];
  requirements?: BookingRequirement[];
  vendors?: BookingVendor[];
  createdAt: string;
};

export type PaymentStatus = "paid" | "due" | "overdue";
export type PaymentMethod = "card" | "bank" | "upi" | "cash";

export type PaymentLogEntry = {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  note?: string;
  createdAt: string;
};

export type VendorLogEntry = {
  id: string;
  name: string;
  category: string;
  email: string;
  rating: number;
  startingRate: number;
  createdAt: string;
};

export type InventoryCategory = "rice" | "dal" | "kirana" | "masala" | "other";
export type InventoryUnit = "kg" | "L" | "pc" | "bag";
export type InventoryStockStatus = "ok" | "low" | "out";

export type InventoryLogEntry = {
  id: string;
  name: string;
  vendorId?: string;
  vendorName: string;
  category: InventoryCategory;
  quantity: number;
  unit: InventoryUnit;
  reorderLevel: number;
  costPerUnit: number;
  createdAt: string;
};

export type BanquetDummyData = {
  customers: CustomerRecord[];
  enquiries: EnquiryLogEntry[];
  bookings: BookingLogEntry[];
  followUps: FollowUpLogEntry[];
  payments: PaymentLogEntry[];
  vendors: VendorLogEntry[];
  inventory: InventoryLogEntry[];
};

export type InventoryRecord = InventoryLogEntry & {
  value: number;
  stockStatus: InventoryStockStatus;
};

export type VendorInventoryGroup = {
  vendorName: string;
  vendorId?: string;
  items: InventoryRecord[];
};

export type VendorRecord = VendorLogEntry & {
  usedInCount: number;
};

export type PaymentRecord = PaymentLogEntry & {
  clientName: string;
  email: string;
  bookingTitle: string;
};

export const BANQUET_DATA = rawData as BanquetDummyData;

export const CUSTOMERS = BANQUET_DATA.customers;

export function getEnquiryLogs(): EnquiryLogEntry[] {
  return getMutableEnquiries();
}

export function getBookingLogs(): BookingLogEntry[] {
  return getMutableBookings();
}

/** @deprecated Use getEnquiryLogs() — reads live store. */
export const ENQUIRY_LOGS = getMutableEnquiries();

/** @deprecated Use getBookingLogs() — reads live store. */
export const BOOKING_LOGS = getMutableBookings();

/** Booking row shape used by the bookings table UI. */
export type BookingRecord = BookingLogEntry & {
  clientName: string;
  email: string;
  phone: string;
  enquiryEventType?: string;
};

/** Enquiry row shape used by the enquiries table UI. */
export type EnquiryRecord = EnquiryLogEntry & {
  clientName: string;
  email: string;
  phone?: string;
  bookingId?: string;
};

/** Enquiry with follow-up summary for the follow-up module. */
export type FollowUpEnquiryRecord = EnquiryRecord & {
  followUpCount: number;
  lastFollowUpAt?: string;
};

/** Calendar event shape derived from booking / enquiry logs. */
export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  venue?: string;
  category: EventCategory;
  status: "confirmed" | "tentative" | "enquiry";
  kind: "booking" | "enquiry";
  client: string;
  customerId: string;
  guests?: number;
  revenue?: number;
  logId: string;
};

const customerMap = new Map(CUSTOMERS.map((customer) => [customer.id, customer]));

export function getCustomerById(customerId: string): CustomerRecord | undefined {
  return customerMap.get(customerId);
}

export function getCustomerForLog(customerId: string): CustomerRecord {
  const customer = getCustomerById(customerId);
  if (!customer) {
    return {
      id: customerId,
      name: "Unknown customer",
      email: "",
      phone: "",
      createdAt: "",
    };
  }
  return customer;
}

export function getEnquiriesForCustomer(customerId: string): EnquiryLogEntry[] {
  return getEnquiryLogs().filter((entry) => entry.customerId === customerId);
}

export function getBookingsForCustomer(customerId: string): BookingLogEntry[] {
  return getBookingLogs().filter((entry) => entry.customerId === customerId);
}

export function getBookingById(bookingId: string): BookingLogEntry | undefined {
  return getBookingLogs().find((entry) => entry.id === bookingId);
}

export function getBookingByEnquiryId(enquiryId: string): BookingLogEntry | undefined {
  return getBookingLogs().find((entry) => entry.enquiryId === enquiryId);
}

export function isEnquiryConverted(enquiryId: string): boolean {
  const enquiry = getEnquiryById(enquiryId);
  return enquiry?.status === "booked" || getBookingLogs().some((entry) => entry.enquiryId === enquiryId);
}

export function getEnquiryById(enquiryId: string): EnquiryLogEntry | undefined {
  return getEnquiryLogs().find((entry) => entry.id === enquiryId);
}

export function getCustomerFromBooking(bookingId: string): CustomerRecord | undefined {
  const booking = getBookingById(bookingId);
  return booking ? getCustomerById(booking.customerId) : undefined;
}

export function getCustomerFromEnquiry(enquiryId: string): CustomerRecord | undefined {
  const enquiry = getEnquiryById(enquiryId);
  return enquiry ? getCustomerById(enquiry.customerId) : undefined;
}

export function toEnquiryRecords(entries = getEnquiryLogs()): EnquiryRecord[] {
  return entries.map((entry) => {
    const customer = getCustomerForLog(entry.customerId);
    const booking = getBookingByEnquiryId(entry.id);
    return {
      ...entry,
      clientName: customer.name,
      email: customer.email,
      phone: customer.phone,
      bookingId: booking?.id,
    };
  });
}

export function getFollowUpLogs(): FollowUpLogEntry[] {
  return getBanquetStore().followUps;
}

export function getFollowUpsForEnquiry(enquiryId: string): FollowUpLogEntry[] {
  return getFollowUpLogs()
    .filter((entry) => entry.enquiryId === enquiryId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function toFollowUpEnquiryRecords(): FollowUpEnquiryRecord[] {
  return toEnquiryRecords()
    .filter((entry) => entry.status !== "booked" && !entry.bookingId)
    .map((entry) => {
      const logs = getFollowUpsForEnquiry(entry.id);
      return {
        ...entry,
        followUpCount: logs.length,
        lastFollowUpAt: logs[0]?.createdAt,
      };
    })
    .sort((a, b) => {
      const aDate = a.nextFollowUpDate ?? "9999-99-99";
      const bDate = b.nextFollowUpDate ?? "9999-99-99";
      return aDate.localeCompare(bDate);
    });
}

export function getFollowUpStats(records = toFollowUpEnquiryRecords(), today = new Date()) {
  const todayKey = format(today, "yyyy-MM-dd");
  const weekEnd = format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), "yyyy-MM-dd");

  const open = records.length;
  const overdue = records.filter((r) => r.nextFollowUpDate && r.nextFollowUpDate < todayKey).length;
  const dueThisWeek = records.filter(
    (r) => r.nextFollowUpDate && r.nextFollowUpDate >= todayKey && r.nextFollowUpDate <= weekEnd,
  ).length;

  return { open, dueThisWeek, overdue };
}

export type FollowUpUrgency = "none" | "scheduled" | "due" | "overdue";

export function getFollowUpUrgency(nextFollowUpDate: string | undefined, today = new Date()): FollowUpUrgency {
  if (!nextFollowUpDate) return "none";
  const todayKey = format(today, "yyyy-MM-dd");
  if (nextFollowUpDate < todayKey) return "overdue";
  if (nextFollowUpDate === todayKey) return "due";
  return "scheduled";
}

export function toBookingRecords(entries = getBookingLogs()): BookingRecord[] {
  return entries.map((entry) => {
    const customer = getCustomerForLog(entry.customerId);
    const enquiry = getEnquiryById(entry.enquiryId);
    return {
      ...entry,
      clientName: customer.name,
      email: customer.email,
      phone: customer.phone,
      enquiryEventType: enquiry?.eventType,
    };
  });
}

export function getBookingDisplayStatus(
  booking: Pick<BookingLogEntry, "date" | "status">,
  today = new Date(),
): BookingDisplayStatus {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "tentative") return "tentative";
  const todayKey = format(today, "yyyy-MM-dd");
  if (booking.date < todayKey) return "completed";
  return "confirmed";
}

export function getBookingRequirementsProgress(requirements: BookingRequirement[] = []) {
  const done = requirements.filter((r) => r.done).length;
  return { done, total: requirements.length };
}

export function getPaymentsForBooking(bookingId: string): PaymentRecord[] {
  return toPaymentRecords().filter((p) => p.bookingId === bookingId);
}

export function bookingToCalendarEvent(booking: BookingLogEntry): CalendarEvent {
  const customer = getCustomerForLog(booking.customerId);
  return {
    id: booking.id,
    logId: booking.id,
    title: booking.title,
    date: booking.date,
    time: booking.time,
    endTime: booking.endTime,
    venue: booking.venue,
    category: booking.category,
    status: booking.status === "confirmed" ? "confirmed" : "tentative",
    kind: "booking",
    client: customer.name,
    customerId: booking.customerId,
    guests: booking.guests,
    revenue: booking.revenue,
  };
}

export function enquiryToCalendarEvent(enquiry: EnquiryLogEntry): CalendarEvent | null {
  if (isEnquiryConverted(enquiry.id)) return null;

  const customer = getCustomerForLog(enquiry.customerId);
  return {
    id: enquiry.id,
    logId: enquiry.id,
    title: `${customer.name} — ${enquiry.eventType}`,
    date: enquiry.preferredDate,
    time: "18:00",
    venue: undefined,
    category: inferEventCategory(enquiry.eventType),
    status: "enquiry",
    kind: "enquiry",
    client: customer.name,
    customerId: enquiry.customerId,
    guests: enquiry.guests,
  };
}

export function getCalendarEvents(): CalendarEvent[] {
  const fromBookings = getBookingLogs().map(bookingToCalendarEvent);
  const fromEnquiries = getEnquiryLogs().map(enquiryToCalendarEvent).filter(
    (event): event is CalendarEvent => event !== null,
  );
  return [...fromBookings, ...fromEnquiries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
  );
}

export function getEventsForDate(date: Date, events = getCalendarEvents()): CalendarEvent[] {
  const key = format(date, "yyyy-MM-dd");
  return events.filter((event) => event.date === key);
}

export function getUpcomingEvents(events = getCalendarEvents(), from = new Date()) {
  const fromKey = format(from, "yyyy-MM-dd");
  return events.filter((event) => event.date >= fromKey);
}

export function getCalendarStats(events = getCalendarEvents(), month = new Date()) {
  const monthKey = format(month, "yyyy-MM");
  const upcoming = getUpcomingEvents(events).length;
  const confirmedThisMonth = events.filter(
    (event) => event.date.startsWith(monthKey) && event.status === "confirmed",
  ).length;
  const revenue = events
    .filter((event) => event.status === "confirmed")
    .reduce((sum, event) => sum + (event.revenue ?? 0), 0);

  return { upcoming, confirmedThisMonth, revenue };
}

export function getDashboardStats(today = new Date()) {
  const monthKey = format(today, "yyyy-MM-dd").slice(0, 7);

  const newLeads = getEnquiryLogs().filter((entry) => entry.status === "new").length;
  const openFollowUps = toFollowUpEnquiryRecords().length;
  const currentMonthBookings = getBookingLogs().filter(
    (booking) => booking.date.startsWith(monthKey) && booking.status !== "cancelled",
  ).length;

  const monthEnquiries = getEnquiryLogs().filter((entry) => entry.createdAt.startsWith(monthKey));
  const monthLeads = monthEnquiries.length;
  const monthConversions = monthEnquiries.filter((entry) => entry.status === "booked").length;
  const conversionRate = monthLeads > 0 ? Math.round((monthConversions / monthLeads) * 100) : 0;

  return {
    newLeads,
    openFollowUps,
    currentMonthBookings,
    monthLeads,
    monthConversions,
    conversionRate,
  };
}

/** Pick a month that actually has sample events (falls back to earliest event month). */
export function getInitialCalendarMonth(events = getCalendarEvents(), today = new Date()): Date {
  if (events.length === 0) return today;

  const todayKey = format(today, "yyyy-MM");
  const hasEventsThisMonth = events.some((event) => event.date.startsWith(todayKey));
  if (hasEventsThisMonth) return today;

  const upcoming = getUpcomingEvents(events, today);
  const anchor = upcoming[0] ?? events[0];
  const [year, month] = anchor.date.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function formatEnquiryBudget(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventTimeRange(event: Pick<CalendarEvent, "time" | "endTime">): string {
  return event.endTime ? `${event.time}–${event.endTime}` : event.time;
}

export function formatEventMeta(event: CalendarEvent, guestsLabel: string): string {
  const parts = [formatEventTimeRange(event)];
  if (event.venue) parts.push(event.venue);
  if (event.guests) parts.push(`${event.guests} ${guestsLabel}`);
  return parts.join(" · ");
}

export function inferEventCategory(eventType: string): EventCategory {
  const lower = eventType.toLowerCase();
  if (lower.includes("corporate")) return "corporate";
  if (
    lower.includes("wedding") ||
    lower.includes("sangeet") ||
    lower.includes("reception")
  ) {
    return "wedding";
  }
  return "private";
}

export function getCustomerActivity(customerId: string) {
  return {
    customer: getCustomerById(customerId),
    enquiries: getEnquiriesForCustomer(customerId),
    bookings: getBookingsForCustomer(customerId),
  };
}

function getCustomerSegment(customerId: string): CustomerSegment {
  const bookings = getBookingsForCustomer(customerId);
  if (bookings.length > 0) {
    const latest = [...bookings].sort((a, b) => b.date.localeCompare(a.date))[0];
    return latest.category;
  }
  const enquiries = getEnquiriesForCustomer(customerId);
  if (enquiries.length > 0) {
    const latest = [...enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return inferEventCategory(latest.eventType);
  }
  return "lead";
}

export function toCustomerRecords(customers = getBanquetStore().customers): CustomerListRecord[] {
  return customers.map((customer) => {
    const enquiries = getEnquiriesForCustomer(customer.id);
    const bookings = getBookingsForCustomer(customer.id);
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.revenue ?? 0), 0);

    return {
      ...customer,
      segment: getCustomerSegment(customer.id),
      enquiryCount: enquiries.length,
      bookingCount: bookings.length,
      totalSpent,
    };
  });
}

export function getPaymentLogs(): PaymentLogEntry[] {
  return getBanquetStore().payments;
}

export function toPaymentRecords(entries = getPaymentLogs()): PaymentRecord[] {
  return entries.map((entry) => {
    const customer = getCustomerForLog(entry.customerId);
    const booking = getBookingById(entry.bookingId);
    return {
      ...entry,
      clientName: customer.name,
      email: customer.email,
      bookingTitle: booking?.title ?? booking?.eventType ?? "—",
    };
  });
}

export function getPaymentStats(records = toPaymentRecords()) {
  const collected = records.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);
  const outstanding = records.filter((r) => r.status === "due").reduce((sum, r) => sum + r.amount, 0);
  const overdue = records.filter((r) => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0);
  return { collected, outstanding, overdue };
}

export const formatPaymentAmount = formatEnquiryBudget;

export function getVendorLogs(): VendorLogEntry[] {
  return getBanquetStore().vendors ?? [];
}

export function getVendorUsageCount(vendor: VendorLogEntry): number {
  const bookings = getBookingLogs();
  const nameKey = vendor.name.toLowerCase();

  return bookings.filter((booking) =>
    booking.vendors?.some(
      (entry) =>
        entry.vendorId === vendor.id ||
        entry.name.toLowerCase() === nameKey ||
        entry.contact.toLowerCase() === vendor.email.toLowerCase(),
    ),
  ).length;
}

export function toVendorRecords(entries = getVendorLogs()): VendorRecord[] {
  return entries.map((entry) => ({
    ...entry,
    usedInCount: getVendorUsageCount(entry),
  }));
}

export function getInventoryLogs(): InventoryLogEntry[] {
  return getBanquetStore().inventory ?? [];
}

export function getInventoryStockStatus(entry: InventoryLogEntry): InventoryStockStatus {
  if (entry.quantity <= 0) return "out";
  if (entry.quantity <= entry.reorderLevel) return "low";
  return "ok";
}

export function toInventoryRecords(entries = getInventoryLogs()): InventoryRecord[] {
  return entries.map((entry) => ({
    ...entry,
    value: entry.quantity * entry.costPerUnit,
    stockStatus: getInventoryStockStatus(entry),
  }));
}

export function getInventoryStats(records = toInventoryRecords()) {
  const totalValue = records.reduce((sum, item) => sum + item.value, 0);
  const lowStock = records.filter((item) => item.stockStatus === "low").length;
  const outOfStock = records.filter((item) => item.stockStatus === "out").length;
  return { totalValue, lowStock, outOfStock };
}

export function groupInventoryByVendor(records = toInventoryRecords()): VendorInventoryGroup[] {
  const groups = new Map<string, VendorInventoryGroup>();

  for (const item of records) {
    const existing = groups.get(item.vendorName);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.vendorName, {
        vendorName: item.vendorName,
        vendorId: item.vendorId,
        items: [item],
      });
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.vendorName.localeCompare(b.vendorName));
}

export function formatInventoryQuantity(quantity: number, unit: InventoryUnit): string {
  return `${quantity} ${unit}`;
}
