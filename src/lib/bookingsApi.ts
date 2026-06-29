import type { BookingRecord } from "@/data/banquetData";
import { inferEventCategory } from "@/data/banquetData";
import type { ConvertEnquiryPayload } from "@/lib/banquetApi";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import { mapTimeSlotLabelToEnum, formatCustomerName } from "@/lib/mappers/enquiryMapper";
import { PACKAGES } from "@/data/enquiryOptions";
import { buildMenuPackageLabel } from "@/lib/menuSelectionMapper";

type ApiBooking = {
  id: string;
  eventId: string;
  bookingNumber: string | null;
  bookingDate: string;
  totalAmount: string;
  finalAmount: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  comments: string | null;
  createdAt: string;
  event: {
    id: string;
    eventType: string;
    eventDate: string;
    customer: {
      firstName: string;
      lastName: string;
      mobileNo: string;
    };
  };
};

type ApiEvent = {
  id: string;
  enquiryId: string;
  customerId: string;
  eventType: string;
  eventDate: string;
  timeSlot: string | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  platePackageId: string | null;
  menuItemIds: string[];
  menuSavedAt: string | null;
  approxBudget: string | null;
  status: string;
};

function mapBookingStatus(status: string): "confirmed" | "tentative" | "cancelled" {
  if (status === "CANCELLED") return "cancelled";
  if (status === "CONFIRMED" || status === "COMPLETED") return "confirmed";
  return "tentative";
}

function mapApiBookingToRecord(
  booking: ApiBooking,
  event?: ApiEvent,
  enquiryId?: string,
): BookingRecord {
  const customerName = formatCustomerName(
    booking.event.customer.firstName,
    booking.event.customer.lastName,
  );

  return {
    id: booking.id,
    customerId: event?.customerId ?? "",
    enquiryId: enquiryId ?? event?.enquiryId ?? "",
    title: booking.comments ?? booking.event.eventType,
    eventType: booking.event.eventType,
    date: booking.event.eventDate,
    time: "18:00",
    venue: event?.venue ?? "",
    category: inferEventCategory(booking.event.eventType),
    status: mapBookingStatus(booking.status),
    guests: event?.guestCount ?? 0,
    revenue: Number.parseFloat(booking.finalAmount) || Number.parseFloat(booking.totalAmount) || 0,
    menuPackage: event?.menuPackage ?? undefined,
    eventId: booking.eventId,
    menuItemCount: event?.menuItemIds?.length ?? 0,
    menuSavedAt: event?.menuSavedAt ?? null,
    platePackageId: event?.platePackageId ?? null,
    createdAt: booking.createdAt,
    clientName: customerName,
    email: "",
    phone: booking.event.customer.mobileNo,
    enquiryEventType: booking.event.eventType,
  };
}

export async function fetchBookingsFromApi(): Promise<BookingRecord[]> {
  const [bookingsPage, eventsPage] = await Promise.all([
    apiRequest<Paginated<ApiBooking>>("/bookings?limit=100&sortBy=createdAt&order=desc"),
    apiRequest<Paginated<ApiEvent>>("/events?limit=100"),
  ]);

  const eventsById = new Map(eventsPage.items.map((event) => [event.id, event]));

  return bookingsPage.items.map((booking) =>
    mapApiBookingToRecord(booking, eventsById.get(booking.eventId)),
  );
}

export async function convertEnquiryToBookingViaApi(
  payload: ConvertEnquiryPayload,
): Promise<BookingRecord> {
  const timeSlotPkg = PACKAGES.find((pkg) => pkg.slots?.some((s) => s.label.includes(payload.time.slice(0, 5))));
  const timeSlot = mapTimeSlotLabelToEnum(payload.time, timeSlotPkg?.id);

  const eventStatus = payload.status === "confirmed" ? "CONFIRMED" : "TENTATIVE";
  const eventBody = {
    eventType: payload.eventType,
    eventDate: payload.date,
    timeSlot,
    guestCount: payload.guests,
    venue: payload.venue,
    menuPackage:
      payload.menuPackage ??
      (payload.platePackageId ? buildMenuPackageLabel(payload.platePackageId) : null),
    platePackageId: payload.platePackageId ?? null,
    approxBudget: payload.revenue,
    status: eventStatus,
  };

  const converted = await apiRequest<{ event: ApiEvent }>(`/enquiries/${payload.enquiryId}/convert`, {
    method: "POST",
    body: eventBody,
  });
  const eventId = converted.event.id;

  const booking = await apiRequest<ApiBooking>("/bookings", {
    method: "POST",
    body: {
      eventId,
      totalAmount: payload.revenue ?? 0,
      status: payload.status === "confirmed" ? "CONFIRMED" : "CONFIRMED",
      comments: payload.title,
    },
  });

  const event = await apiRequest<ApiEvent>(`/events/${eventId}`);
  return mapApiBookingToRecord(booking, event, payload.enquiryId);
}
