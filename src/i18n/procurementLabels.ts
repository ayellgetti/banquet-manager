import type { Lang } from "./index";
import { useT } from "./index";
import { PROCUREMENT_ITEM_TRANSLATIONS } from "./procurementItemTranslations";
import { PROCUREMENT_CATEGORY_TRANSLATIONS, PROCUREMENT_UNIT_TRANSLATIONS } from "./procurementMetaTranslations";

export function procurementItemLabel(id: string, fallback: string, lang: Lang): string {
  if (lang === "en") return fallback;
  return PROCUREMENT_ITEM_TRANSLATIONS[id]?.[lang] ?? fallback;
}

export function procurementCategoryLabel(category: string, lang: Lang): string {
  if (lang === "en") return category;
  return PROCUREMENT_CATEGORY_TRANSLATIONS[category]?.[lang] ?? category;
}

export function procurementUnitLabel(unit: string, lang: Lang): string {
  if (lang === "en") return unit;
  return PROCUREMENT_UNIT_TRANSLATIONS[unit]?.[lang] ?? unit;
}

export function buildProcurementLabelDict(lang: Lang): Record<string, string> {
  if (lang === "en") return {};
  const dict: Record<string, string> = {};
  for (const [id, labels] of Object.entries(PROCUREMENT_ITEM_TRANSLATIONS)) {
    if (labels[lang]) dict[`procurement.item.${id}`] = labels[lang];
  }
  for (const [cat, labels] of Object.entries(PROCUREMENT_CATEGORY_TRANSLATIONS)) {
    if (labels[lang]) dict[`procurement.cat.${cat}`] = labels[lang];
  }
  for (const [unit, labels] of Object.entries(PROCUREMENT_UNIT_TRANSLATIONS)) {
    if (labels[lang]) dict[`procurement.unit.${unit}`] = labels[lang];
  }
  return dict;
}

export function useProcurementLabels() {
  const { lang } = useT();
  return {
    itemName: (item: { id: string; name: string }) => procurementItemLabel(item.id, item.name, lang),
    categoryName: (cat: string) => procurementCategoryLabel(cat, lang),
    unitName: (unit: string) => procurementUnitLabel(unit, lang),
  };
}
