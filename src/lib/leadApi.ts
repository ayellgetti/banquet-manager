import { apiRequest, publicApiRequest } from "@/lib/apiClient";
import { isAuthenticated } from "@/lib/authStorage";
import type { CrmLeadPayload } from "@/lib/mappers/enquiryMapper";

export type LeadCreateResult = {
  customerId: string;
  enquiryId: string;
  eventId: string;
};

export async function createLeadViaCrm(payload: CrmLeadPayload): Promise<LeadCreateResult> {
  if (isAuthenticated()) {
    return apiRequest<LeadCreateResult>("/leads", {
      method: "POST",
      body: payload,
    });
  }

  return publicApiRequest<LeadCreateResult>("/public/leads", payload);
}
