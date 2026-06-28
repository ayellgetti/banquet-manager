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

import { toEnquiryRecords } from "./banquetData";

/** Pipeline table rows with customer name & email joined from dummy JSON. */
export const ENQUIRY_RECORDS = toEnquiryRecords();
