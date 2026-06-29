import type { QuickEnquiryFormValues } from "@/components/enquiry/QuickEnquiryForm";
import type { EnquiryRecord, EnquiryStatus } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import {
  buildEnquiryUpdatePayload,
  mapEnquiryDetailToFormValues,
  type EnquiryEditContext,
} from "@/lib/enquiryEditMapper";
import {
  mapTimeSlotLabelToEnum,
  parseApproxBudgetRange,
} from "@/lib/mappers/enquiryMapper";
import { mapLeadStatusToFrontend, type BackendLeadStatus } from "@/lib/mappers/statusMapper";
import { formatCustomerName } from "@/lib/mappers/enquiryMapper";
import {
  DECOR_OPTIONS,
  PACKAGES,
  PLATE_PACKAGES,
  VENUE_OPTIONS,
} from "@/data/enquiryOptions";

type ApiEnquiry = {
  id: string;
  customerId: string;
  enquiryDate: string;
  leadSource: string | null;
  status: BackendLeadStatus;
  remarks: string | null;
  createdAt: string;
  eventId: string | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    mobileNo: string;
  };
};

type ApiEvent = {
  id: string;
  enquiryId: string;
  eventType: string;
  eventDate: string;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  approxBudget: string | null;
  status: string;
};

function parseBudget(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapApiEnquiryToRecord(enquiry: ApiEnquiry, event?: ApiEvent): EnquiryRecord {
  const clientName = formatCustomerName(enquiry.customer.firstName, enquiry.customer.lastName);

  return {
    id: enquiry.id,
    customerId: enquiry.customerId,
    eventType: event?.eventType ?? enquiry.remarks ?? "Enquiry",
    preferredDate: event?.eventDate ?? enquiry.enquiryDate,
    guests: event?.guestCount ?? 0,
    budget: parseBudget(event?.approxBudget),
    status: mapLeadStatusToFrontend(enquiry.status),
    note: enquiry.remarks ?? undefined,
    source: enquiry.leadSource ?? undefined,
    createdAt: enquiry.createdAt,
    clientName,
    email: "",
    phone: enquiry.customer.mobileNo,
    bookingId: enquiry.status === "CONVERTED" ? enquiry.eventId ?? undefined : undefined,
  };
}

export async function fetchEnquiriesFromApi(): Promise<EnquiryRecord[]> {
  const [enquiriesPage, eventsPage] = await Promise.all([
    apiRequest<Paginated<ApiEnquiry>>("/enquiries?limit=100&sortBy=createdAt&order=desc"),
    apiRequest<Paginated<ApiEvent>>("/events?limit=100&sortBy=createdAt&order=desc"),
  ]);

  const eventsByEnquiryId = new Map(eventsPage.items.map((event) => [event.enquiryId, event]));

  return enquiriesPage.items.map((enquiry) =>
    mapApiEnquiryToRecord(enquiry, eventsByEnquiryId.get(enquiry.id)),
  );
}

export async function fetchOpenEnquiriesFromApi(): Promise<EnquiryRecord[]> {
  const enquiries = await fetchEnquiriesFromApi();
  return enquiries.filter(
    (enquiry) => enquiry.status !== ("booked" satisfies EnquiryStatus) && !enquiry.bookingId,
  );
}

type ApiEnquiryDetail = {
  id: string;
  customerId: string;
  enquiryDate: string;
  leadSource: string | null;
  status: BackendLeadStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  eventId: string | null;
  assignedTo: string | null;
  customer: {
    firstName: string;
    lastName: string;
    mobileNo: string;
  };
  assignedUser: {
    firstName: string;
    lastName: string;
    username: string;
  } | null;
};

type ApiEventDetail = {
  id: string;
  enquiryId: string;
  eventType: string;
  eventDate: string;
  timeSlot: "MORNING" | "EVENING" | "FULL_DAY" | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  approxBudget: string | null;
  decorationRequired: boolean;
  specialRequirements: string | null;
  status: string;
};

function extractMetadataLine(text: string | null, prefix: string): string | null {
  if (!text) return null;
  const line = text
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().startsWith(prefix.toLowerCase()));
  return line ? line.slice(prefix.length).trim() : null;
}

function formatTimeSlotLabel(slot: ApiEventDetail["timeSlot"]): string | null {
  if (!slot) return null;
  const labels: Record<string, string> = {
    MORNING: "Morning",
    EVENING: "Evening",
    FULL_DAY: "Full Day",
  };
  return labels[slot] ?? slot;
}

async function resolveEventForEnquiry(enquiry: ApiEnquiryDetail): Promise<ApiEventDetail | null> {
  if (enquiry.eventId) {
    return apiRequest<ApiEventDetail>(`/events/${enquiry.eventId}`);
  }

  const eventsPage = await apiRequest<Paginated<ApiEventDetail>>(
    "/events?limit=100&page=1&sortBy=createdAt&order=desc",
  );
  return eventsPage.items.find((item) => item.enquiryId === enquiry.id) ?? null;
}

export type EnquiryViewDetail = {
  id: string;
  customerId: string;
  clientName: string;
  phone: string;
  status: EnquiryStatus;
  eventType: string;
  preferredDate: string;
  enquiryDate: string;
  guests: number;
  budget: number;
  approxBudgetRange: string | null;
  source: string | null;
  venue: string | null;
  timeSlot: string | null;
  menuPackage: string | null;
  decorationRequired: boolean;
  decoration: string | null;
  remarks: string | null;
  specialRequirements: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  bookingId?: string;
  eventStatus: string | null;
};

export async function fetchEnquiryViewDetailFromApi(enquiryId: string): Promise<EnquiryViewDetail> {
  const enquiry = await apiRequest<ApiEnquiryDetail>(`/enquiries/${enquiryId}`);
  const event = await resolveEventForEnquiry(enquiry);
  const clientName = formatCustomerName(enquiry.customer.firstName, enquiry.customer.lastName);
  const budget = parseBudget(event?.approxBudget);
  const remarks = enquiry.remarks;
  const specialRequirements = event?.specialRequirements ?? null;
  const decoration =
    extractMetadataLine(remarks, "Decoration:") ??
    extractMetadataLine(specialRequirements, "Decoration:");
  const approxBudgetRange =
    extractMetadataLine(remarks, "Approx budget:") ??
    extractMetadataLine(specialRequirements, "Approx budget:");
  const assignedTo = enquiry.assignedUser
    ? `${enquiry.assignedUser.firstName} ${enquiry.assignedUser.lastName}`.trim() ||
      enquiry.assignedUser.username
    : null;

  return {
    id: enquiry.id,
    customerId: enquiry.customerId,
    clientName,
    phone: enquiry.customer.mobileNo,
    status: mapLeadStatusToFrontend(enquiry.status),
    eventType: event?.eventType ?? "—",
    preferredDate: event?.eventDate ?? enquiry.enquiryDate,
    enquiryDate: enquiry.enquiryDate,
    guests: event?.guestCount ?? 0,
    budget,
    approxBudgetRange,
    source: enquiry.leadSource,
    venue: event?.venue ?? extractMetadataLine(specialRequirements, "Venue:"),
    timeSlot: formatTimeSlotLabel(event?.timeSlot ?? null),
    menuPackage: event?.menuPackage,
    decorationRequired: event?.decorationRequired ?? false,
    decoration,
    remarks,
    specialRequirements,
    createdAt: enquiry.createdAt,
    updatedAt: enquiry.updatedAt,
    assignedTo,
    bookingId: enquiry.status === "CONVERTED" ? event?.id ?? enquiry.eventId ?? undefined : undefined,
    eventStatus: event?.status ?? null,
  };
}

export async function fetchEnquiryFormValues(enquiryId: string): Promise<{
  values: QuickEnquiryFormValues;
  context: EnquiryEditContext;
}> {
  const enquiry = await apiRequest<ApiEnquiryDetail>(`/enquiries/${enquiryId}`);
  const event = await resolveEventForEnquiry(enquiry);

  return {
    values: mapEnquiryDetailToFormValues(enquiry, event),
    context: {
      enquiryId: enquiry.id,
      customerId: enquiry.customerId,
      eventId: event?.id ?? enquiry.eventId ?? undefined,
    },
  };
}

export async function updateEnquiryFromQuickForm(
  context: EnquiryEditContext,
  form: QuickEnquiryFormValues,
): Promise<void> {
  const timeSlot = PACKAGES.find((pkg) => pkg.id === form.timeSlotId);
  const menu = PLATE_PACKAGES.find((pkg) => pkg.id === form.menuPackageId);
  const venue = VENUE_OPTIONS.find((item) => item.id === form.venueId);
  const decorationNames = DECOR_OPTIONS.filter((item) => form.decorationIds.includes(item.id)).map(
    (item) => item.name,
  );

  const { customerBody, enquiryBody, eventBody } = buildEnquiryUpdatePayload(context, form, {
    timeSlot: mapTimeSlotLabelToEnum(
      timeSlot?.slots?.[0]?.label ?? timeSlot?.name ?? "",
      form.timeSlotId,
    ),
    venueName: venue?.name ?? "",
    menuLabel: menu ? `${menu.name} (₹${menu.basePrice}/plate)` : "",
    decorationNames,
    approxBudget: parseApproxBudgetRange(form.approxBudget),
  });

  await apiRequest(`/customers/${context.customerId}`, {
    method: "PATCH",
    body: customerBody,
  });

  await apiRequest(`/enquiries/${context.enquiryId}`, {
    method: "PATCH",
    body: enquiryBody,
  });

  if (context.eventId) {
    await apiRequest(`/events/${context.eventId}`, {
      method: "PATCH",
      body: eventBody,
    });
    return;
  }

  await apiRequest("/events", {
    method: "POST",
    body: {
      enquiryId: context.enquiryId,
      customerId: context.customerId,
      ...eventBody,
    },
  });
}
