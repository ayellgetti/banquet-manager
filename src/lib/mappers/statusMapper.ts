import type { EnquiryStatus } from "@/data/banquetData";

export type BackendLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "QUOTATION_SENT"
  | "NEGOTIATION"
  | "CONVERTED"
  | "LOST";

export function mapLeadStatusToFrontend(status: BackendLeadStatus): EnquiryStatus {
  switch (status) {
    case "NEW":
      return "new";
    case "CONTACTED":
    case "LOST":
      return "contacted";
    case "FOLLOW_UP":
    case "QUOTATION_SENT":
    case "NEGOTIATION":
      return "qualified";
    case "CONVERTED":
      return "booked";
    default:
      return "new";
  }
}

export function mapFrontendStatusToBackend(status: EnquiryStatus): BackendLeadStatus {
  switch (status) {
    case "new":
      return "NEW";
    case "contacted":
      return "CONTACTED";
    case "qualified":
      return "FOLLOW_UP";
    case "booked":
      return "CONVERTED";
    default:
      return "NEW";
  }
}
