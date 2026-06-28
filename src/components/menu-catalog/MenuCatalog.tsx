import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MENU_ITEMS,
  type MenuCategory,
  type MenuItem,
} from "@/data/enquiryOptions";
import { VISITING_CARD_BUSINESS_NAME } from "@/data/visitingCard";
import { BanquetHeader } from "@/components/visiting-card/BanquetHeader";
import {
  BORDER_GOLD,
  BOX_BORDER,
  BROWN,
  CARD_FONT,
  CREAM,
  GOLD,
  GOLD_LIGHT,
} from "@/components/visiting-card/cardTheme";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { toast } from "sonner";

const PAGE_COUNT = 2;

/** Catalog display order — custom sequence for print layout. */
const MENU_CATALOG_CATEGORY_ORDER: MenuCategory[] = [
  "Welcome Drink",
  "Starters",
  "Main Course",
  "Kathiawadi",
  "Rajasthani",
  "Indian Breads",
  "Rice",
  "Dal",
  "Farsan",
  "Raita",
  "Salads",
  "Sweets & Ice Cream",
  "Live Counters",
  "Breakfast",
];

const SUB_LABEL_WIDTH = "w-[5.5rem] sm:w-[7rem] lg:w-[7.5rem]";

function groupItemsByCategory(items: MenuItem[]): Map<MenuCategory, MenuItem[]> {
  const map = new Map<MenuCategory, MenuItem[]>();
  for (const item of items) {
    const category = item.category as MenuCategory;
    const list = map.get(category);
    if (list) list.push(item);
    else map.set(category, [item]);
  }
  return map;
}

function splitCategoriesForPages(
  categories: MenuCategory[],
  byCategory: Map<MenuCategory, MenuItem[]>,
): MenuCategory[][] {
  const nonEmpty = categories.filter((cat) => (byCategory.get(cat)?.length ?? 0) > 0);
  const total = nonEmpty.reduce((sum, cat) => sum + (byCategory.get(cat)?.length ?? 0), 0);
  const target = Math.ceil(total / PAGE_COUNT);

  const pages: MenuCategory[][] = [[]];
  let currentCount = 0;

  for (const cat of nonEmpty) {
    const count = byCategory.get(cat)?.length ?? 0;
    if (pages.length < PAGE_COUNT && currentCount >= target && pages[0].length > 0) {
      pages.push([]);
      currentCount = 0;
    }
    pages[pages.length - 1].push(cat);
    currentCount += count;
  }

  while (pages.length < PAGE_COUNT) pages.push([]);
  return pages.slice(0, PAGE_COUNT);
}

function groupBySubcategory(items: MenuItem[]): { sub: string; items: MenuItem[] }[] {
  const groups = new Map<string, MenuItem[]>();
  for (const item of items) {
    const key = item.subcategory ?? "";
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()].map(([sub, groupItems]) => ({ sub, items: groupItems }));
}

const MenuItemChip = ({ item }: { item: MenuItem }) => {
  const menuLabels = useMenuLabels();

  return (
    <li
      className="menu-catalog-item inline-flex max-w-full items-center rounded-md px-2 py-1 text-[10px] leading-snug sm:text-[11px]"
      data-menu-catalog-item
      data-menu-catalog-box
      style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
    >
      <span className="whitespace-normal break-words">{menuLabels.itemName(item)}</span>
    </li>
  );
};

const MenuItemFlow = ({ items }: { items: MenuItem[] }) => (
  <ul className="menu-catalog-items flex min-w-0 flex-1 flex-wrap gap-1.5">
    {items.map((item) => (
      <MenuItemChip key={item.id} item={item} />
    ))}
  </ul>
);

const SubcategoryLabel = ({ label }: { label: string }) => (
  <p
    className={cn(
      "menu-catalog-sub-label shrink-0 text-[10px] font-bold uppercase leading-tight tracking-[0.08em] sm:text-[11px]",
      SUB_LABEL_WIDTH,
    )}
    style={{ color: GOLD }}
  >
    {label}
  </p>
);

const CategoryRow = ({
  label,
  items,
  showDivider,
}: {
  label?: string;
  items: MenuItem[];
  showDivider?: boolean;
}) => {
  const menuLabels = useMenuLabels();

  return (
    <div
      className={cn(
        "menu-catalog-row flex flex-row items-start gap-x-3 px-2 py-2 sm:px-3 sm:py-2.5",
        showDivider && "border-b",
      )}
      data-menu-catalog-row
      style={showDivider ? { borderColor: GOLD_LIGHT } : undefined}
    >
      {label ? <SubcategoryLabel label={menuLabels.subcategoryName(label)} /> : null}
      <MenuItemFlow items={items} />
    </div>
  );
};

const CategoryBody = ({
  subGroups,
  hasSub,
  items,
}: {
  subGroups: { sub: string; items: MenuItem[] }[];
  hasSub: boolean;
  items: MenuItem[];
}) => {
  if (hasSub) {
    return (
      <div className="menu-catalog-body">
        {subGroups.map(({ sub, items: subItems }, index) => (
          <CategoryRow
            key={sub || "__default"}
            label={sub}
            items={subItems}
            showDivider={index < subGroups.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="menu-catalog-body">
      <CategoryRow items={items} />
    </div>
  );
};

const CategorySection = ({ category, items }: { category: MenuCategory; items: MenuItem[] }) => {
  const menuLabels = useMenuLabels();
  const subGroups = useMemo(() => groupBySubcategory(items), [items]);
  const hasSub = subGroups.some((group) => group.sub);

  return (
    <section
      className="menu-catalog-category overflow-hidden rounded-lg shadow-soft"
      data-menu-catalog-category
      style={{ border: BORDER_GOLD, backgroundColor: CREAM, fontFamily: CARD_FONT }}
    >
      <div
        className="border-b px-3 py-1.5 text-center sm:py-2"
        style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
      >
        <h2 className="text-sm font-bold leading-tight sm:text-base" style={{ color: GOLD }}>
          {menuLabels.categoryName(category)}
        </h2>
      </div>
      <CategoryBody subGroups={subGroups} hasSub={hasSub} items={items} />
    </section>
  );
};

const CatalogPage = ({
  categories,
  byCategory,
  pageNumber,
  showTitle,
}: {
  categories: MenuCategory[];
  byCategory: Map<MenuCategory, MenuItem[]>;
  pageNumber: number;
  showTitle: boolean;
}) => {
  const { t } = useT();

  return (
    <div
      className="menu-catalog-page mx-auto w-full max-w-[210mm] space-y-1.5 rounded-lg bg-white p-2 shadow-soft sm:p-3"
      data-menu-catalog-page={pageNumber}
      style={{ fontFamily: CARD_FONT }}
    >
      <BanquetHeader showContactActions compact />

      {showTitle ? (
        <div
          className="menu-catalog-title rounded-lg px-2 py-1.5 text-center shadow-soft"
          data-menu-catalog-box
          style={{ border: BORDER_GOLD, backgroundColor: CREAM }}
        >
          <h1 className="text-base font-bold leading-tight sm:text-lg" style={{ color: GOLD }}>
            {t("menuCatalog.title")}
          </h1>
          <p className="mt-0.5 text-[10px] leading-snug sm:text-[11px]" style={{ color: BROWN }}>
            {t("menuCatalog.subtitle")}
          </p>
        </div>
      ) : null}

      <div className="menu-catalog-categories space-y-1.5">
        {categories.map((category) => {
          const items = byCategory.get(category);
          if (!items?.length) return null;
          return <CategorySection key={category} category={category} items={items} />;
        })}
      </div>
    </div>
  );
};

export const MenuCatalog = () => {
  const { t } = useT();
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const byCategory = useMemo(() => groupItemsByCategory(MENU_ITEMS), []);
  const pages = useMemo(
    () => splitCategoriesForPages(MENU_CATALOG_CATEGORY_ORDER, byCategory),
    [byCategory],
  );

  const handleDownloadPdf = async () => {
    const element = document.getElementById("menu-catalog-print-area");
    if (!element) return;

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(
        element,
        `${VISITING_CARD_BUSINESS_NAME.replace(/\s+/g, "_")}_Menu_Catalog.pdf`,
        { margin: 4 },
      );
      toast.dismiss(loadingToast);
      if (result === "view") {
        toast.info(t("toast.pdfOpenedMobile"), { duration: 8000 });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error(t("toast.pdfFailed"));
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div id="menu-catalog-print-area" className="mx-auto w-full max-w-[210mm] space-y-3">
        {pages.map((categories, index) => (
          <CatalogPage
            key={index}
            categories={categories}
            byCategory={byCategory}
            pageNumber={index + 1}
            showTitle={index === 0}
          />
        ))}
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          onClick={() => void handleDownloadPdf()}
          disabled={isPdfGenerating}
        >
          <Printer className="h-4 w-4" />
          {isPdfGenerating ? t("toast.pdfGenerating") : t("menuCatalog.downloadPdf")}
        </Button>
      </div>
    </div>
  );
};
