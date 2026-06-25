import type { Lang } from "./index";
import { useT } from "./index";
import { MENU_ITEM_TRANSLATIONS } from "./menuItemTranslations";
import { MENU_CATEGORY_TRANSLATIONS, MENU_SUBCATEGORY_TRANSLATIONS, COMMON_PLATE_TRANSLATIONS } from "./menuMetaTranslations";

export function menuItemLabel(id: string, fallback: string, lang: Lang): string {
  if (lang === "en") return fallback;
  return MENU_ITEM_TRANSLATIONS[id]?.[lang] ?? fallback;
}

export function menuCategoryLabel(category: string, lang: Lang): string {
  if (lang === "en") {
    if (category === "Sweets & Ice Cream") return "Sweets or Ice Cream";
    return category;
  }
  return MENU_CATEGORY_TRANSLATIONS[category]?.[lang] ?? category;
}

export function menuSubcategoryLabel(subcategory: string, lang: Lang): string {
  if (lang === "en") return subcategory;
  return MENU_SUBCATEGORY_TRANSLATIONS[subcategory]?.[lang] ?? subcategory;
}

export function commonPlateLabel(item: string, lang: Lang): string {
  if (lang === "en") return item;
  return COMMON_PLATE_TRANSLATIONS[item]?.[lang] ?? item;
}

export function buildMenuLabelDict(lang: Lang): Record<string, string> {
  if (lang === "en") return {};
  const dict: Record<string, string> = {};
  for (const [id, labels] of Object.entries(MENU_ITEM_TRANSLATIONS)) {
    if (labels[lang]) dict[`menu.item.${id}`] = labels[lang];
  }
  for (const [cat, labels] of Object.entries(MENU_CATEGORY_TRANSLATIONS)) {
    if (labels[lang]) dict[`menu.cat.${cat}`] = labels[lang];
  }
  for (const [sub, labels] of Object.entries(MENU_SUBCATEGORY_TRANSLATIONS)) {
    if (labels[lang]) dict[`menu.sub.${sub}`] = labels[lang];
  }
  for (const [item, labels] of Object.entries(COMMON_PLATE_TRANSLATIONS)) {
    if (labels[lang]) dict[`menu.common.${item}`] = labels[lang];
  }
  return dict;
}

export function useMenuLabels() {
  const { lang, t } = useT();
  return {
    itemName: (item: { id: string; name: string }) => menuItemLabel(item.id, item.name, lang),
    categoryName: (cat: string) => menuCategoryLabel(cat, lang),
    subcategoryName: (sub: string) => menuSubcategoryLabel(sub, lang),
    commonPlateName: (item: string) => commonPlateLabel(item, lang),
  };
}
