import { describe, expect, it } from "vitest";
import {
  formatCustomerName,
  mapEnquiryLeadPayloadToCrm,
  normalizeMobileNo,
  splitCustomerName,
} from "@/lib/mappers/enquiryMapper";
import { mapLeadStatusToFrontend } from "@/lib/mappers/statusMapper";

describe("enquiryMapper", () => {
  it("splits customer names", () => {
    expect(splitCustomerName("Rahul Sharma")).toEqual({
      firstName: "Rahul",
      lastName: "Sharma",
    });
    expect(splitCustomerName("Madonna")).toEqual({
      firstName: "Madonna",
      lastName: ".",
    });
  });

  it("formats customer names for display", () => {
    expect(formatCustomerName("Rahul", "Sharma")).toBe("Rahul Sharma");
    expect(formatCustomerName("Madonna", ".")).toBe("Madonna");
    expect(formatCustomerName("Ravina", "Kohe")).toBe("Ravina Kohe");
  });

  it("normalizes mobile numbers", () => {
    expect(normalizeMobileNo("+91 98765 01234")).toBe("9876501234");
  });

  it("maps lead payload to CRM payload", () => {
    const mapped = mapEnquiryLeadPayloadToCrm({
      name: "Rahul Sharma",
      mobileNo: "9876501234",
      eventDate: "2026-09-15",
      eventSlot: "Evening 04:00 PM – 10:00 PM",
      eventMenuRange: "Gold (₹1200/plate)",
      eventNumberOfGuest: "150",
      eventType: "Wedding",
      eventAdditionDetail: "Venue: Grand Hall\nSource: Website\nApprox budget: 2Lac - 3Lac\nModule: Enquiry v2",
    });

    expect(mapped.firstName).toBe("Rahul");
    expect(mapped.lastName).toBe("Sharma");
    expect(mapped.timeSlot).toBe("EVENING");
    expect(mapped.guestCount).toBe(150);
    expect(mapped.leadSource).toBe("Website");
    expect(mapped.approxBudget).toBe(250000);
  });
});

describe("statusMapper", () => {
  it("maps backend statuses to frontend statuses", () => {
    expect(mapLeadStatusToFrontend("NEW")).toBe("new");
    expect(mapLeadStatusToFrontend("FOLLOW_UP")).toBe("qualified");
    expect(mapLeadStatusToFrontend("CONVERTED")).toBe("booked");
  });
});
