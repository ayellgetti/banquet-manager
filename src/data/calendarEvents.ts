export type {
  CalendarEvent,
  EventCategory,
  BookingLogEntry,
  CustomerRecord,
  EnquiryLogEntry,
} from "./banquetData";

export {
  BOOKING_LOGS,
  ENQUIRY_LOGS,
  CUSTOMERS,
  getCalendarEvents,
  getCalendarStats,
  getCustomerById,
  getCustomerFromBooking,
  getCustomerFromEnquiry,
  getBookingsForCustomer,
  getEnquiriesForCustomer,
  getCustomerActivity,
  getEventsForDate,
  getUpcomingEvents,
  formatEventMeta,
  formatEventTimeRange,
} from "./banquetData";

import { getCalendarEvents, type CalendarEvent } from "./banquetData";

export type EventKind = CalendarEvent["kind"];
export type EventStatus = CalendarEvent["status"];

/** Calendar events derived from booking & enquiry log entries in dummy JSON. */
export const CALENDAR_EVENTS = getCalendarEvents();
