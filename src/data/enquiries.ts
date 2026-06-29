export type { EnquiryRecord, EnquiryStatus, EnquiryLogEntry, CustomerRecord } from "./banquetData";
export {
  ENQUIRY_LOGS,
  CUSTOMERS,
  BOOKING_LOGS,
  formatEnquiryBudget,
  toEnquiryRecords,
  getCustomerById,
  getCustomerActivity,
  getBookingsForCustomer,
  getEnquiriesForCustomer,
  getCustomerFromEnquiry,
  getCustomerFromBooking,
} from "./banquetData";

import type { EnquiryRecord } from "./banquetData";

/** Empty fallback — enquiry lists load from the API. */
export const ENQUIRY_RECORDS: EnquiryRecord[] = [];
