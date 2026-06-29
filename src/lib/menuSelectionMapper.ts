import { PLATE_PACKAGES } from "@/data/enquiryOptions";
import { initialEnquiry, type EnquiryState } from "@/types/enquiry";
import { formatCustomerName } from "@/lib/mappers/enquiryMapper";
import { sanitizeEventDate } from "@/lib/eventDateValidation";
import { matchMenuPackageId } from "@/lib/enquiryEditMapper";
import type { EventDetailRecord } from "@/lib/eventsApi";

export function resolvePlatePackageId(
  event: Pick<EventDetailRecord, "platePackageId" | "menuPackage">,
): string {
  return event.platePackageId ?? matchMenuPackageId(event.menuPackage) ?? "";
}

export function buildMenuPackageLabel(platePackageId: string): string | null {
  const plate = PLATE_PACKAGES.find((pkg) => pkg.id === platePackageId);
  if (!plate) return null;
  return `${plate.name} (₹${plate.basePrice}/plate)`;
}

export function mapEventToMenuEnquiryState(event: EventDetailRecord): EnquiryState {
  return {
    ...initialEnquiry,
    packageId: "",
    stageId: "",
    chairId: "",
    decorIds: [],
    extraIds: [],
    venueId: "",
    selectMenuLater: false,
    platePackageId: resolvePlatePackageId(event),
    menuItemIds: event.menuItemIds ?? [],
    basics: {
      customerName: formatCustomerName(event.customer.firstName, event.customer.lastName),
      phone: event.customer.mobileNo,
      eventType: event.eventType,
      eventDate: sanitizeEventDate(event.eventDate),
      guestCount: event.guestCount && event.guestCount > 0 ? event.guestCount : 100,
      source: "",
      approxBudget: "",
    },
  };
}
