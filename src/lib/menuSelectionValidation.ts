import {
  getMenuSubcategoryErrors,
  getSwappablePoolStatus,
  isSwappableMenuCategory,
  MENU_ITEMS,
  PLATE_PACKAGES,
  SWAPPABLE_MENU_CATEGORIES,
} from "@/data/enquiryOptions";

type ValidateMenuInput = {
  platePackageId: string;
  menuItemIds: string[];
  guestCount?: number;
};

export function validateMenuSelection(
  input: ValidateMenuInput,
  t: (key: string) => string,
  options?: { checkMinPax?: boolean; categoryLabel?: (cat: string) => string },
): string[] {
  const errors: string[] = [];

  if (!input.platePackageId) {
    errors.push(t("toast.needPlatePackage"));
    return errors;
  }

  if (input.menuItemIds.length === 0) {
    errors.push(t("toast.needPlate"));
    return errors;
  }

  const plate = PLATE_PACKAGES.find((p) => p.id === input.platePackageId);
  const limits = (plate?.limits ?? {}) as Record<string, number>;
  const pool = getSwappablePoolStatus(input.menuItemIds, limits);

  if (!pool.isComplete) {
    errors.push(
      t("toast.needSwappablePool")
        .replace("{n}", String(pool.required))
        .replace("{selected}", String(pool.selected)),
    );
  }

  for (const [cat, limit] of Object.entries(limits)) {
    if (!limit || isSwappableMenuCategory(cat)) continue;
    const selected = MENU_ITEMS.filter(
      (m) => m.category === cat && input.menuItemIds.includes(m.id),
    ).length;
    if (selected < limit) {
      const catLabel = options?.categoryLabel?.(cat) ?? cat;
      errors.push(
        t("toast.needMenuIncluded").replace("{cat}", catLabel).replace("{n}", String(limit)),
      );
    }
  }

  getMenuSubcategoryErrors(input.menuItemIds).forEach((e) => errors.push(e.message));

  if (options?.checkMinPax && plate) {
    const minPax = plate.minPax ?? 0;
    if (minPax > 0 && (input.guestCount || 0) < minPax) {
      errors.push(t("validate.minPax").replace("{n}", String(minPax)));
    }
  }

  return errors;
}

export function getMenuSelectionInvalidCategories(input: ValidateMenuInput): Set<string> {
  const invalid = new Set<string>();
  if (!input.platePackageId) return invalid;

  const plate = PLATE_PACKAGES.find((p) => p.id === input.platePackageId);
  const limits = (plate?.limits ?? {}) as Record<string, number>;
  const pool = getSwappablePoolStatus(input.menuItemIds, limits);

  if (!pool.isComplete) {
    SWAPPABLE_MENU_CATEGORIES.forEach((cat) => invalid.add(cat));
  }

  for (const [cat, limit] of Object.entries(limits)) {
    if (!limit || isSwappableMenuCategory(cat)) continue;
    const selected = MENU_ITEMS.filter(
      (m) => m.category === cat && input.menuItemIds.includes(m.id),
    ).length;
    if (selected < limit) invalid.add(cat);
  }

  return invalid;
}
