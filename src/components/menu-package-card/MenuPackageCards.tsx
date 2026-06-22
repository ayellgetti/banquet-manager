import { useMemo, useState, type ReactNode } from "react";
import { Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_EXTRA_PRICES,
  COMMON_PLATE_ITEMS,
  CUSTOM_PLATE_PACKAGE_ID,
  formatMenuPackageExtraPrice,
  MENU_CATEGORY_ORDER,
  MENU_PACKAGE_CARD_EXTRAS,
  PACKAGES,
  PLATE_PACKAGES,
  VENUE_OPTIONS,
  getCategoryExtraPrice,
  sortMenuCategories,
  type MenuCategory,
  type PlatePackage,
} from "@/data/enquiryOptions";
import { VISITING_CARD_ADDRESS, VISITING_CARD_BUSINESS_NAME, VISITING_CARD_CONTACTS, VISITING_CARD_QR_CODES } from "@/data/visitingCard";
import { BanquetHeader } from "@/components/visiting-card/BanquetHeader";
import { GoldDivider } from "@/components/visiting-card/GoldDivider";
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
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { toast } from "sonner";

const getEliteRateCategories = (): MenuCategory[] => {
  const cats = MENU_CATEGORY_ORDER.filter((cat) => CATEGORY_EXTRA_PRICES[cat] != null);
  return [...cats.filter((cat) => cat !== "Breakfast"), ...(cats.includes("Breakfast") ? ["Breakfast" as const] : [])];
};

const SectionShell = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section
    className="menu-package-section overflow-hidden rounded-lg shadow-soft"
    style={{ border: BORDER_GOLD, backgroundColor: CREAM, fontFamily: CARD_FONT }}
  >
    <div
      className="rounded-t-lg border-b px-3 py-1.5 text-center sm:px-4"
      style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
    >
      <h2 className="text-sm font-bold sm:text-base" style={{ color: GOLD }}>
        {title}
      </h2>
      {note ? (
        <p className="mx-auto mt-1 max-w-2xl text-[9px] leading-snug sm:text-[10px]" style={{ color: BROWN }}>
          {note}
        </p>
      ) : null}
    </div>
    <div className="p-2 sm:p-3">{children}</div>
  </section>
);

const MenuPackageCardPreview = ({ plate }: { plate: PlatePackage }) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();

  const categories = useMemo(
    () => sortMenuCategories(Object.keys(plate.limits)),
    [plate.limits],
  );

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-soft"
      data-menu-package-box
      style={{
        border: BORDER_GOLD,
        boxSizing: "border-box",
        backgroundColor: CREAM,
        fontFamily: CARD_FONT,
      }}
    >
      <div className="flex flex-1 flex-col space-y-2 px-2.5 pb-2.5 pt-2.5 sm:px-3">
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: GOLD }}>
            {plate.name}
          </p>
          <p className="mt-0.5 text-[11px] leading-tight" style={{ color: BROWN }}>
            {plate.basePrice > 0
              ? `₹${plate.basePrice.toLocaleString("en-IN")}${t("menuPackageCard.perPlate")}`
              : t("menu.customPlate")}
            {plate.minPax != null && (
              <span className="block text-[10px] opacity-80">
                {t("menu.minPax").replace("{n}", String(plate.minPax))}
              </span>
            )}
          </p>
        </div>

        <GoldDivider className="max-w-[180px]" />

        <div>
          <p
            className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.15em]"
            style={{ color: GOLD }}
          >
            {t("menuPackageCard.includes")}
          </p>
          {categories.length > 0 ? (
            <ul className="space-y-0.5">
              {categories.map((cat) => {
                const count = plate.limits[cat as keyof typeof plate.limits];
                if (count == null) return null;
                return (
                  <li
                    key={cat}
                    className="flex items-start justify-between gap-1 rounded px-1.5 py-0.5 text-[10px] sm:text-[11px]"
                    data-menu-package-box
                    data-menu-package-category
                    style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
                  >
                    <span className="min-w-0 flex-1 break-words leading-tight">
                      {menuLabels.categoryName(cat)}
                    </span>
                    <span className="shrink-0 pl-1 font-semibold tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        {plate.extras?.length ? (
          <div
            className="rounded px-1.5 py-1 text-[9px] leading-snug"
            data-menu-package-box
            style={{ border: BOX_BORDER, backgroundColor: "#fffef8", color: BROWN }}
          >
            {plate.extras.join(" · ")}
          </div>
        ) : null}

        <GoldDivider className="max-w-[180px]" />

        <div>
          <p
            className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.15em]"
            style={{ color: GOLD }}
          >
            {t("menu.includedEvery")}
          </p>
          <p className="text-center text-[9px] leading-snug sm:text-[10px]" style={{ color: BROWN }}>
            {COMMON_PLATE_ITEMS.map(menuLabels.commonPlateName).join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
};

const ElitePackageCardPreview = ({ plate }: { plate: PlatePackage }) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const rateCategories = useMemo(() => getEliteRateCategories(), []);

  return (
    <div
      className="overflow-hidden rounded-lg bg-white shadow-soft"
      data-menu-package-box
      style={{
        border: BORDER_GOLD,
        boxSizing: "border-box",
        backgroundColor: CREAM,
        fontFamily: CARD_FONT,
      }}
    >
      <div className="flex flex-row items-stretch">
        <div
          className="flex w-[4.5rem] shrink-0 flex-col justify-center border-r px-2 py-2 text-center sm:w-24"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <p className="text-xs font-bold leading-tight sm:text-sm" style={{ color: GOLD }}>
            {plate.name}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight" style={{ color: BROWN }}>
            {t("menu.customPlate")}
          </p>
          {plate.minPax != null && (
            <p className="mt-0.5 text-[9px] leading-tight opacity-80" style={{ color: BROWN }}>
              {t("menu.minPax").replace("{n}", String(plate.minPax))}
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 px-2 py-2 sm:px-3">
          <p
            className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{ color: GOLD }}
          >
            {t("menuPackageCard.categoryRates")}
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {rateCategories.map((cat) => (
              <li
                key={cat}
                className="flex min-w-0 flex-col gap-0.5 rounded px-1.5 py-1"
                data-menu-package-box
                style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
              >
                <span className="break-words text-[9px] leading-tight sm:text-[10px]">
                  {menuLabels.categoryName(cat)}
                </span>
                <span className="text-[9px] font-semibold tabular-nums sm:text-[10px]">
                  ₹{getCategoryExtraPrice(cat)}
                  {t("menuPackageCard.perPlateShort")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="border-t px-2 py-1.5 text-center sm:px-3"
        style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
      >
        <p
          className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ color: GOLD }}
        >
          {t("menu.includedEvery")}
        </p>
        <p className="text-[9px] leading-snug sm:text-[10px]" style={{ color: BROWN }}>
          {COMMON_PLATE_ITEMS.map(menuLabels.commonPlateName).join(" · ")}
        </p>
      </div>
    </div>
  );
};

const ExtraSection = () => (
  <ul className="grid grid-cols-3 gap-1">
    {MENU_PACKAGE_CARD_EXTRAS.map((item) => (
      <li
        key={item.id}
        className="flex min-w-0 flex-col gap-0.5 rounded px-1.5 py-1"
        data-menu-package-box
        style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
      >
        <span className="break-words text-[9px] leading-tight sm:text-[10px]">{item.name}</span>
        {item.price != null || item.priceMax != null ? (
          <span className="text-[9px] font-semibold tabular-nums sm:text-[10px]">
            {formatMenuPackageExtraPrice(item)}
          </span>
        ) : item.detail ? (
          <span className="break-words text-[8px] leading-tight sm:text-[9px]">{item.detail}</span>
        ) : null}
        {item.detail && (item.price != null || item.priceMax != null) ? (
          <span className="break-words text-[8px] leading-tight opacity-90 sm:text-[9px]">{item.detail}</span>
        ) : null}
      </li>
    ))}
  </ul>
);

const HallRentSection = () => {
  const { t } = useT();
  const venue = VENUE_OPTIONS[0];

  return (
    <div className="space-y-2 sm:space-y-3">
      {venue ? (
        <div
          className="rounded px-2.5 py-2 text-center"
          data-menu-package-box
          style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
        >
          <p className="text-[11px] font-semibold" style={{ color: GOLD }}>{venue.name}</p>
          <p className="mt-0.5 text-[10px]">{venue.description}</p>
          <p className="mt-1 text-xs font-bold tabular-nums" style={{ color: GOLD }}>
            ₹{venue.pricePerHour.toLocaleString("en-IN")}
            {t("menuPackageCard.perHour")}
          </p>
        </div>
      ) : null}

      <ul className="grid gap-1 sm:grid-cols-2">
        {PACKAGES.map((pkg) => {
          const slot = pkg.slots?.[0];
          if (!slot || !pkg.hourlyRate) return null;
          const total = pkg.hourlyRate * slot.hours;
          return (
            <li
              key={pkg.id}
              className="flex items-center justify-between gap-2 rounded px-2 py-1 text-[10px] sm:text-[11px]"
              data-menu-package-box
              style={{ border: BOX_BORDER, backgroundColor: "#ffffff", color: BROWN }}
            >
              <span className="min-w-0 leading-tight">
                {slot.label}
                <span className="block text-[9px] opacity-75">
                  {slot.hours}
                  {t("menuPackageCard.hours")}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </li>
          );
        })}
      </ul>

      <ul
        className="grid grid-cols-1 gap-0.5 text-[9px] leading-snug sm:grid-cols-2 sm:text-[10px]"
        style={{ color: BROWN }}
      >
        <li>• {t("summary.pdfTerms.included.hall")}</li>
        <li>• {t("summary.pdfTerms.included.stage")}</li>
        <li>• {t("summary.pdfTerms.included.av")}</li>
        <li>• {t("summary.pdfTerms.included.seating")}</li>
        <li>• {t("summary.pdfTerms.included.changingRooms")}</li>
        <li>• {t("summary.pdfTerms.included.parking")}</li>
        <li>• {t("summary.pdfTerms.included.elevator")}</li>
        <li>• {t("summary.pdfTerms.included.dining")}</li>
      </ul>
    </div>
  );
};

export const MenuPackageCards = () => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const standardPackages = useMemo(
    () => PLATE_PACKAGES.filter((p) => p.id !== CUSTOM_PLATE_PACKAGE_ID),
    [],
  );
  const elitePackage = useMemo(
    () => PLATE_PACKAGES.find((p) => p.id === CUSTOM_PLATE_PACKAGE_ID),
    [],
  );

  const commonPlateLine = `${t("menu.includedEvery")} ${COMMON_PLATE_ITEMS.map(menuLabels.commonPlateName).join(" · ")}`;

  const formatPackageShareBlock = (plate: PlatePackage) => {
    const isElite = plate.id === CUSTOM_PLATE_PACKAGE_ID;
    const rateCategories = getEliteRateCategories();
    const lines = [
      plate.name,
      plate.basePrice > 0
        ? `₹${plate.basePrice}${t("menuPackageCard.perPlate")}`
        : t("menu.customPlate"),
      ...(plate.minPax != null
        ? [t("menu.minPax").replace("{n}", String(plate.minPax))]
        : []),
      isElite ? t("menuPackageCard.categoryRates") : t("menuPackageCard.includes"),
      ...(isElite
        ? rateCategories.map(
            (cat) => `${menuLabels.categoryName(cat)} — ₹${getCategoryExtraPrice(cat)}${t("menuPackageCard.perPlateShort")}`,
          )
        : sortMenuCategories(Object.keys(plate.limits)).map((cat) => {
            const count = plate.limits[cat as keyof typeof plate.limits];
            return count != null ? `${menuLabels.categoryName(cat)} — ${count}` : null;
          }).filter(Boolean) as string[]),
      ...(!isElite && plate.extras?.length ? plate.extras : []),
      commonPlateLine,
    ];
    return lines.join("\n");
  };

  const buildShareText = () => {
    const packageSection = standardPackages.map(formatPackageShareBlock).join("\n\n");
    const eliteSection = elitePackage ? formatPackageShareBlock(elitePackage) : "";

    const venue = VENUE_OPTIONS[0];
    const hallLines = PACKAGES.map((pkg) => {
      const slot = pkg.slots?.[0];
      if (!slot || !pkg.hourlyRate) return null;
      return `${slot.label}: ₹${(pkg.hourlyRate * slot.hours).toLocaleString("en-IN")}`;
    }).filter(Boolean);

    return [
      VISITING_CARD_BUSINESS_NAME,
      VISITING_CARD_ADDRESS,
      "",
      ...VISITING_CARD_CONTACTS.flatMap((c) => [`${c.name}: ${c.phone}`]),
      "",
      t("menuPackageCard.section.packages"),
      t("menuPackageCard.packagesNote"),
      packageSection,
      "",
      t("menuPackageCard.section.customPackage"),
      t("menuPackageCard.menuOnlyNote"),
      eliteSection,
      "",
      t("menuPackageCard.section.recommendedPackages"),
      t("menuPackageCard.menuOnlyNote"),
      packageSection,
      "",
      t("menuPackageCard.section.extraAndDecoration"),
      MENU_PACKAGE_CARD_EXTRAS.map((item) => {
        const sizes = item.detail ? ` (${item.detail})` : "";
        return `${item.name}${sizes}: ${formatMenuPackageExtraPrice(item)}`;
      }).join("\n"),
      "",
      t("menuPackageCard.section.hallRent"),
      venue ? `${venue.name}: ₹${venue.pricePerHour}/hr` : "",
      ...hallLines,
      "",
      t("visitingCard.qrScanLabel"),
      ...VISITING_CARD_QR_CODES.map((qr) => `${t(qr.labelKey)}: ${qr.href}`),
    ].join("\n");
  };

  const handleShare = async () => {
    const shareText = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("module.menuPackageCard.title"),
          text: shareText,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(t("menuPackageCard.copied"));
    } catch {
      toast.error(t("menuPackageCard.copyFailed"));
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("menu-package-card-print-area");
    if (!element) return;

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(
        element,
        `${VISITING_CARD_BUSINESS_NAME.replace(/\s+/g, "_")}_Menu_Packages.pdf`,
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
      <p className="no-print text-sm text-muted-foreground">{t("menuPackageCard.desc")}</p>

      <div id="menu-package-card-print-area" className="mx-auto w-full max-w-[210mm] space-y-1.5">
        <BanquetHeader showContactActions />

        <SectionShell title={t("menuPackageCard.section.packages")} note={t("menuPackageCard.packagesNote")}>
          <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {standardPackages.map((plate) => (
              <div key={plate.id} className="min-w-0">
                <MenuPackageCardPreview plate={plate} />
              </div>
            ))}
          </div>
        </SectionShell>

        {elitePackage ? (
          <SectionShell title={t("menuPackageCard.section.customPackage")} note={t("menuPackageCard.menuOnlyNote")}>
            <ElitePackageCardPreview plate={elitePackage} />
          </SectionShell>
        ) : null}

        <SectionShell title={t("menuPackageCard.section.recommendedPackages")} note={t("menuPackageCard.menuOnlyNote")}>
          <div className="grid items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {standardPackages.map((plate) => (
              <div key={`recommended-${plate.id}`} className="min-w-0">
                <MenuPackageCardPreview plate={plate} />
              </div>
            ))}
          </div>
        </SectionShell>

        <div className="grid gap-1.5 lg:grid-cols-2">
          <SectionShell title={t("menuPackageCard.section.extraAndDecoration")}>
            <ExtraSection />
          </SectionShell>

          <SectionShell title={t("menuPackageCard.section.hallRent")}>
            <HallRentSection />
          </SectionShell>
        </div>
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="gap-2" onClick={() => void handleShare()}>
          <Share2 className="h-4 w-4" />
          {t("menuPackageCard.share")}
        </Button>
        <Button
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          onClick={() => void handleDownloadPdf()}
          disabled={isPdfGenerating}
        >
          <Printer className="h-4 w-4" />
          {isPdfGenerating ? t("toast.pdfGenerating") : t("menuPackageCard.downloadPdf")}
        </Button>
      </div>
    </div>
  );
};
