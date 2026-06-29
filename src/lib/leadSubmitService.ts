import { submitEnquiryLead, type EnquiryLeadPayload } from "@/lib/enquiryApi";
import { createLeadViaCrm } from "@/lib/leadApi";
import {
  mapEnquiryLeadPayloadToCrm,
  mapQuickEnquiryToCrm,
  type CrmLeadPayload,
  type QuickEnquiryCrmInput,
} from "@/lib/mappers/enquiryMapper";
import { toast } from "sonner";

export type DualWriteResult = {
  sheetOk: boolean;
  crmOk: boolean;
};

function notifyDualWriteResult(result: DualWriteResult) {
  if (result.sheetOk && result.crmOk) {
    toast.success("Enquiry saved to sheet and CRM");
    return;
  }

  if (result.sheetOk && !result.crmOk) {
    toast.warning("Sheet saved; CRM sync failed");
    return;
  }

  if (!result.sheetOk && result.crmOk) {
    toast.warning("Saved to CRM; sheet sync failed");
    return;
  }

  toast.error("Enquiry submission failed");
}

export async function submitEnquiryLeadDualWrite(
  payload: EnquiryLeadPayload,
): Promise<DualWriteResult> {
  const crmPayload = mapEnquiryLeadPayloadToCrm(payload);
  return submitDualWrite(crmPayload, () => submitEnquiryLead(payload));
}

export async function submitQuickEnquiryDualWrite(
  input: QuickEnquiryCrmInput,
  sheetPayload: EnquiryLeadPayload,
): Promise<DualWriteResult> {
  const crmPayload = mapQuickEnquiryToCrm(input);
  return submitDualWrite(crmPayload, () => submitEnquiryLead(sheetPayload));
}

async function submitDualWrite(
  crmPayload: CrmLeadPayload,
  sheetSubmit: () => Promise<unknown>,
): Promise<DualWriteResult> {
  const [sheetResult, crmResult] = await Promise.allSettled([
    sheetSubmit(),
    createLeadViaCrm(crmPayload),
  ]);

  const result: DualWriteResult = {
    sheetOk: sheetResult.status === "fulfilled",
    crmOk: crmResult.status === "fulfilled",
  };

  if (!result.sheetOk) {
    console.error("Sheet submission failed:", sheetResult);
  }
  if (!result.crmOk) {
    console.error("CRM submission failed:", crmResult);
  }

  notifyDualWriteResult(result);

  if (!result.sheetOk && !result.crmOk) {
    throw new Error("Enquiry submission failed");
  }

  return result;
}
