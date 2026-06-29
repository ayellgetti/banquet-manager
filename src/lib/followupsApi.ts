import type { FollowUpEnquiryRecord, FollowUpLogEntry, EnquiryStatus } from "@/data/banquetData";
import type { LogFollowUpInput } from "@/data/banquetStore";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import { fetchOpenEnquiriesFromApi } from "@/lib/enquiriesApi";
import { toApiFollowUpDateTime } from "@/lib/followUpDateTime";
import { mapFrontendStatusToBackend, mapLeadStatusToFrontend, type BackendLeadStatus } from "@/lib/mappers/statusMapper";

type ApiFollowup = {
  id: string;
  enquiryId: string;
  comments: string | null;
  followupDate: string;
  nextFollowupDate: string | null;
  communicationType: string | null;
  createdAt: string;
  enquiry: {
    id: string;
    status: BackendLeadStatus;
  };
  followedByUser: {
    firstName: string;
    lastName: string;
  } | null;
};

export type FollowUpHistoryRecord = FollowUpLogEntry & {
  followupDate: string;
  communicationType: string | null;
  followedByName: string | null;
};

function mapFollowupToHistoryRecord(followup: ApiFollowup, status?: EnquiryStatus): FollowUpHistoryRecord {
  const enquiryStatus = status ?? mapLeadStatusToFrontend(followup.enquiry.status);

  return {
    id: followup.id,
    enquiryId: followup.enquiryId,
    comment: followup.comments ?? "",
    status: enquiryStatus,
    previousStatus: enquiryStatus,
    nextFollowUpDate: followup.nextFollowupDate ?? undefined,
    createdAt: followup.createdAt,
    followupDate: followup.followupDate,
    communicationType: followup.communicationType,
    followedByName: followup.followedByUser
      ? `${followup.followedByUser.firstName} ${followup.followedByUser.lastName}`.trim()
      : null,
  };
}

export async function fetchFollowUpHistoryFromApi(enquiryId: string): Promise<FollowUpHistoryRecord[]> {
  const page = await apiRequest<Paginated<ApiFollowup>>(
    `/followups?enquiryId=${enquiryId}&limit=100&sortBy=createdAt&order=desc`,
  );

  return page.items.map((item) => mapFollowupToHistoryRecord(item));
}

export async function fetchFollowUpEnquiriesFromApi(): Promise<FollowUpEnquiryRecord[]> {
  const [enquiries, followupsPage] = await Promise.all([
    fetchOpenEnquiriesFromApi(),
    apiRequest<Paginated<ApiFollowup>>("/followups?limit=100&sortBy=createdAt&order=desc"),
  ]);

  const followupsByEnquiry = new Map<string, ApiFollowup[]>();
  for (const followup of followupsPage.items) {
    const list = followupsByEnquiry.get(followup.enquiryId) ?? [];
    list.push(followup);
    followupsByEnquiry.set(followup.enquiryId, list);
  }

  return enquiries
    .map((enquiry) => {
      const logs = followupsByEnquiry.get(enquiry.id) ?? [];
      const sorted = [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return {
        ...enquiry,
        followUpCount: logs.length,
        lastFollowUpAt: sorted[0]?.createdAt,
        nextFollowUpDate: sorted[0]?.nextFollowupDate ?? enquiry.nextFollowUpDate,
      };
    })
    .sort((a, b) => {
      const aDate = a.nextFollowUpDate ?? "9999-99-99";
      const bDate = b.nextFollowUpDate ?? "9999-99-99";
      return aDate.localeCompare(bDate);
    });
}

export async function logFollowUpViaApi(input: LogFollowUpInput): Promise<FollowUpLogEntry> {
  const nextFollowupDate = input.nextFollowUpDate ? toApiFollowUpDateTime(input.nextFollowUpDate) : null;

  const followup = await apiRequest<ApiFollowup>("/followups", {
    method: "POST",
    body: {
      enquiryId: input.enquiryId,
      comments: input.comment,
      nextFollowupDate,
      enquiryStatus: mapFrontendStatusToBackend(input.status),
    },
  });

  return mapFollowupToHistoryRecord(followup, input.status);
}
