import { useMemo } from "react";
import { PlatePackageComparison } from "@/components/enquiry/PlatePackageComparison";
import { SelectableCard } from "@/components/enquiry/SelectableCard";
import { MenuPackageAlerts } from "@/components/enquiry/MenuPackageAlerts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  filterMenuIdsForPackage,
  getIncludedMenuItemIds,
  getCategoryExtraPrice,
  getLiveCounterExtraLabel,
  getMenuCardPriceLabel,
  getMenuItemsForPackage,
  getSwappablePoolLimit,
  isCustomPlatePackage,
  isSwappableMenuCategory,
  LIVE_COUNTER_RULES,
  MENU_ITEMS,
  PLATE_PACKAGES,
  sortMenuCategories,
  SWAPPABLE_MENU_CATEGORIES,
} from "@/data/enquiryOptions";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { getMenuSelectionInvalidCategories } from "@/lib/menuSelectionValidation";

const toggle = (arr: string[], id: string) =>
  arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

type Props = {
  platePackageId: string;
  menuItemIds: string[];
  onPlatePackageChange: (id: string) => void;
  onMenuItemIdsChange: (ids: string[]) => void;
  lockPlatePackage?: boolean;
  guestCount?: number;
  showValidation?: boolean;
};

export const MenuDishSelector = ({
  platePackageId,
  menuItemIds,
  onPlatePackageChange,
  onMenuItemIdsChange,
  lockPlatePackage = false,
  guestCount,
  showValidation = false,
}: Props) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();

  const menuByCategory = useMemo(
    () =>
      MENU_ITEMS.reduce<Record<string, typeof MENU_ITEMS>>((acc, m) => {
        (acc[m.category] ||= []).push(m);
        return acc;
      }, {}),
    [],
  );

  const selectedPlate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
  const selectedPlateLimits = (selectedPlate?.limits ?? {}) as Record<string, number>;
  const menuIncludedIds = getIncludedMenuItemIds(menuItemIds, selectedPlateLimits);
  const isCustomPlate = isCustomPlatePackage(platePackageId);
  const invalidCats = showValidation
    ? getMenuSelectionInvalidCategories({ platePackageId, menuItemIds, guestCount })
    : new Set<string>();

  const handlePlateSelect = (newId: string) => {
    onPlatePackageChange(newId);
    onMenuItemIdsChange(newId ? filterMenuIdsForPackage(menuItemIds, newId) : []);
  };

  return (
    <div className="space-y-4">
      {!lockPlatePackage && !platePackageId && (
        <p className="text-sm text-muted-foreground">{t("menu.selectPlatePackage")}</p>
      )}
      {lockPlatePackage && platePackageId && (
        <p className="text-sm text-muted-foreground">{t("menuSelection.plateLocked")}</p>
      )}

      <PlatePackageComparison
        selectedId={platePackageId}
        invalid={showValidation && !platePackageId}
        {...(lockPlatePackage && platePackageId
          ? {}
          : { onSelect: handlePlateSelect })}
      />

      <MenuPackageAlerts
        platePackageId={platePackageId}
        menuItemIds={menuItemIds}
        selectMenuLater={false}
        isMenuSelection
        swappableInvalid={
          invalidCats.size > 0 && SWAPPABLE_MENU_CATEGORIES.some((c) => invalidCats.has(c))
        }
      />

      {!platePackageId ? (
        <p className="text-sm text-muted-foreground">{t("menu.selectPlate")}</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {sortMenuCategories(Object.keys(menuByCategory))
            .filter((cat) => {
              const items = menuByCategory[cat];
              if (!items?.length) return false;
              const plate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
              if (!plate) return false;
              if (isCustomPlatePackage(plate.id)) return true;
              if (isSwappableMenuCategory(cat)) {
                return getSwappablePoolLimit(plate.limits) > 0;
              }
              return ((plate.limits as Record<string, number>)[cat] ?? 0) > 0;
            })
            .map((cat) => {
              const items = menuByCategory[cat];
              const plate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
              const limit = (plate?.limits as Record<string, number> | undefined)?.[cat] ?? 0;
              const isSwappable = isSwappableMenuCategory(cat);
              const catItems = platePackageId ? getMenuItemsForPackage(platePackageId, cat) : items;
              const selectedItems = catItems.filter((m) => menuItemIds.includes(m.id));
              const selectedCount = selectedItems.length;
              const extraCount = selectedItems.filter((m) => !menuIncludedIds.has(m.id)).length;
              const catInvalid = invalidCats.has(cat);

              return (
                <AccordionItem
                  key={cat}
                  value={cat}
                  className={`mb-2 overflow-hidden rounded-lg border border-b-0 bg-white ${catInvalid ? "ring-2 ring-destructive/60" : ""}`}
                >
                  <AccordionTrigger className="bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline">
                    <span className="flex flex-wrap items-center gap-2">
                      {menuLabels.categoryName(cat)}
                      {isSwappable ? (
                        selectedCount > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {selectedCount} {t("menu.selected")}
                          </span>
                        )
                      ) : limit > 0 ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${catInvalid ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}
                        >
                          {Math.min(selectedCount, limit)}/{limit} {t("menu.included")}
                        </span>
                      ) : (
                        selectedCount > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            {selectedCount} {t("menu.selected")}
                          </span>
                        )
                      )}
                      {extraCount > 0 && !isCustomPlate && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          +{extraCount} {t("menu.extra")}
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="bg-white px-4 pb-4">
                    <p className="pt-3 text-xs text-muted-foreground">
                      {isSwappable
                        ? t("menu.swappableCategoryHint")
                        : cat === "Live Counters"
                          ? limit > 0
                            ? `First ${limit} counter type${limit > 1 ? "s" : ""} included. Extra counters charged per counter type (see rates below).`
                            : "Custom plate — each live counter charged per counter type."
                          : limit > 0
                            ? `First ${limit} selection${limit > 1 ? "s" : ""} included. Extras: ₹${getCategoryExtraPrice(cat)}/plate${cat === "Welcome Drink" || cat === "Sweets & Ice Cream" ? " (+ premiums for special items)" : ""}.`
                            : `Custom plate — ₹${getCategoryExtraPrice(cat)}/plate per dish.`}
                    </p>
                    {renderCategoryItems({
                      catItems,
                      menuItemIds,
                      menuIncludedIds,
                      isCustomPlate,
                      menuLabels,
                      t,
                      onToggle: (id) => onMenuItemIdsChange(toggle(menuItemIds, id)),
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}
    </div>
  );
};

function renderCategoryItems({
  catItems,
  menuItemIds,
  menuIncludedIds,
  isCustomPlate,
  menuLabels,
  t,
  onToggle,
}: {
  catItems: typeof MENU_ITEMS;
  menuItemIds: string[];
  menuIncludedIds: Set<string>;
  isCustomPlate: boolean;
  menuLabels: ReturnType<typeof useMenuLabels>;
  t: (key: string) => string;
  onToggle: (id: string) => void;
}) {
  const hasSub = catItems.some((m) => m.subcategory);
  const groups: Record<string, typeof catItems> = {};
  catItems.forEach((m) => {
    const key = m.subcategory || "";
    (groups[key] ||= []).push(m);
  });

  const renderCard = (m: (typeof MENU_ITEMS)[number]) => {
    const isSel = menuItemIds.includes(m.id);
    const isBeyondIncluded = isSel && !menuIncludedIds.has(m.id);
    const { price, subtitle } = getMenuCardPriceLabel(m, {
      selected: isSel,
      customPlate: isCustomPlate,
      beyondIncluded: isBeyondIncluded,
      includedLabel: t("menu.included"),
      extraCounterLabel: t("menu.extraCounter"),
      beyondLimitLabel: t("menu.beyondLimit"),
    });

    return (
      <SelectableCard
        key={m.id}
        selected={isSel}
        onClick={() => onToggle(m.id)}
        title={menuLabels.itemName(m)}
        price={price}
        subtitle={subtitle}
        compact
      />
    );
  };

  if (!hasSub) {
    return (
      <div className="grid gap-2 pt-3 sm:grid-cols-3 lg:grid-cols-4">
        {catItems.map(renderCard)}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full pt-3">
      {Object.entries(groups).map(([sub, subItems]) => {
        const subSelCount = subItems.filter((m) => menuItemIds.includes(m.id)).length;
        const subHasExtra =
          !isCustomPlate &&
          subItems.some((m) => menuItemIds.includes(m.id) && !menuIncludedIds.has(m.id));
        const subRule = sub ? LIVE_COUNTER_RULES[sub] : undefined;

        return (
          <AccordionItem
            key={sub}
            value={sub}
            className="mb-2 overflow-hidden rounded-md border border-b-0 bg-white"
          >
            <AccordionTrigger className="bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:no-underline">
              <span className="flex flex-wrap items-center gap-2">
                {sub ? menuLabels.subcategoryName(sub) : "Other"}
                {subRule && (
                  <span className="font-normal normal-case text-muted-foreground">
                    {getLiveCounterExtraLabel(sub)}
                  </span>
                )}
                {subRule?.minSelection && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                    min {subRule.minSelection}
                  </span>
                )}
                {subSelCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                    {subSelCount} {t("menu.selected")}
                  </span>
                )}
                {subHasExtra && (
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    {t("menu.extra")}
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="bg-white px-3 pb-3">
              <div className="grid gap-2 pt-3 sm:grid-cols-3 lg:grid-cols-4">
                {subItems.map(renderCard)}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
