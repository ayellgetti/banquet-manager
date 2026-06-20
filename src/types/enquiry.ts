import type { EnquiryApiResponse } from "@/lib/enquiryApi";

export type BasicDetails = {
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  source: string;
  approxBudget: string;
};

export type EnquiryState = {
  basics: BasicDetails;
  packageId: string;
  slotId: string;
  platePackageId: string;
  menuItemIds: string[];
  decorIds: string[];
  stageId: string;
  chairId: string;
  extraIds: string[];
  venueId: string;
  discountPercent: number;
  discountAmount: number;
  discountType: "percent" | "fixed";
  notes: string;
  leadApiResponse: EnquiryApiResponse | null;
  selectMenuLater: boolean;
};

export const initialEnquiry: EnquiryState = {
  basics: {
    customerName: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: 100,
    source: "",
    approxBudget: "",
  },
  packageId: "silver-morning",
  slotId: "",
  platePackageId: "",
  menuItemIds: [],
  decorIds: [],
  stageId: "s0",
  chairId: "c1",
  extraIds: [],
  venueId: "",
  discountPercent: 0,
  discountAmount: 0,
  discountType: "percent",
  notes: "",
  leadApiResponse: null,
  selectMenuLater: false,
};