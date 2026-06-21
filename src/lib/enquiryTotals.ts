import {
  PACKAGES,
  PLATE_PACKAGES,
  DECOR_OPTIONS,
  STAGE_OPTIONS,
  CHAIR_OPTIONS,
  EXTRA_SERVICES,
  VENUE_OPTIONS,
  calcExtraDishesPerPlate,
} from "@/data/enquiryOptions";
import type { EnquiryState } from "@/types/enquiry";

export type LineItem = { label: string; detail?: string; amount: number };

export function buildLineItems(s: EnquiryState): LineItem[] {
  const guests = Math.max(0, s.basics.guestCount || 0);
  const items: LineItem[] = [];

  const pkg = PACKAGES.find((p) => p.id === s.packageId);
  if (pkg) {
    if (pkg.pricePerPlate > 0) {
      items.push({
        label: `${pkg.name} Package`,
        detail: "Lumpsum",
        amount: pkg.pricePerPlate,
      });
    }
  }

  const plate = PLATE_PACKAGES.find((p) => p.id === s.platePackageId);
  if (plate) {
    const { extraCount, extrasPerPlate: extras } = calcExtraDishesPerPlate(
      s.menuItemIds,
      plate.limits,
    );
    const perPlate = plate.basePrice + extras;
    items.push({
      label: `${plate.name} (Menu)`,
      detail: `₹${perPlate.toLocaleString("en-IN")}/plate × ${guests} guests${
        extras > 0 ? ` (incl. ${extraCount} extra dish${extraCount > 1 ? "es" : ""} @ ₹${extras}/plate)` : ""
      }`,
      amount: perPlate * guests,
    });
  }

  s.decorIds.forEach((id) => {
    const d = DECOR_OPTIONS.find((x) => x.id === id);
    if (d) items.push({ label: `Decor: ${d.name}`, amount: d.price });
  });

  const stage = STAGE_OPTIONS.find((x) => x.id === s.stageId);
  if (stage) items.push({ label: `Stage: ${stage.name}`, amount: stage.price });

  const chair = CHAIR_OPTIONS.find((c) => c.id === s.chairId);
  if (chair) {
    const chairsIncluded = !!pkg?.perks?.includes("Chair");
    const isStandardChair = chair.id === "c1";
    const amount =
      chairsIncluded && isStandardChair ? 0 : chair.pricePerUnit * guests;
    items.push({
      label: `Chairs: ${chair.name}`,
      detail:
        chairsIncluded && isStandardChair
          ? "Included in package"
          : `${guests} × ₹${chair.pricePerUnit}`,
      amount,
    });
  }

  s.extraIds.forEach((id) => {
    const e = EXTRA_SERVICES.find((x) => x.id === id);
    if (e) {
      const amount = e.unit === "per guest" ? e.price * guests : e.price;
      items.push({ label: `Extra: ${e.name}`, detail: e.unit, amount });
    }
  });

  const venue = VENUE_OPTIONS.find((v) => v.id === s.venueId);
  if (venue) {
    const slot = pkg?.slots?.find((sl) => sl.id === s.slotId) || pkg?.slots?.[0];
    const hours = slot?.hours ?? 0;
    const hallRentIncluded = !!pkg;
    items.push({
      label: `Venue: ${venue.name}`,
      detail: hallRentIncluded
        ? hours > 0
          ? `Hall rent included · ${hours}h`
          : "Hall rent included in package"
        : hours > 0
          ? `${hours}h × ₹${venue.pricePerHour.toLocaleString("en-IN")}/hr`
          : `₹${venue.pricePerHour.toLocaleString("en-IN")}/hr · select a package for hours`,
      amount: hallRentIncluded ? 0 : venue.pricePerHour * hours,
    });
  }

  return items;
}

export function calcTotals(s: EnquiryState) {
  const items = buildLineItems(s);
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const rawDiscount =
    s.discountType === "fixed"
      ? s.discountAmount || 0
      : Math.round((subtotal * (s.discountPercent || 0)) / 100);
  const discount = Math.max(0, Math.min(subtotal, rawDiscount));
  const total = subtotal - discount;
  return { items, subtotal, discount, total };
}

/** Menu-only per-plate cost (base package rate + any extra dishes). */
export function calcMenuPerPlate(s: EnquiryState): number {
  const plate = PLATE_PACKAGES.find((p) => p.id === s.platePackageId);
  if (!plate) return 0;
  const { extrasPerPlate } = calcExtraDishesPerPlate(s.menuItemIds, plate.limits);
  return plate.basePrice + extrasPerPlate;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);