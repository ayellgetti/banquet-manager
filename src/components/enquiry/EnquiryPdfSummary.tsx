import {
  PACKAGES,
  MENU_ITEMS,
  PLATE_PACKAGES,
  DECOR_OPTIONS,
  STAGE_OPTIONS,
  CHAIR_OPTIONS,
  EXTRA_SERVICES,
  VENUE_OPTIONS,
  DJ_EXTRA_ID,
  getIncludedMenuItemIds,
  getItemExtraPrice,
  getLiveCounterExtraLabel,
  isSwappableMenuCategory,
} from "@/data/enquiryOptions";
import type { EnquiryState } from "@/types/enquiry";
import { calcTotals, formatINR } from "@/lib/enquiryTotals";
import { PlatePackageComparison } from "./PlatePackageComparison";
import { MenuPackageAlerts } from "./MenuPackageAlerts";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";

const PDF_TERMS_INCLUDED = [
  "summary.pdfTerms.included.hall",
  "summary.pdfTerms.included.stage",
  "summary.pdfTerms.included.av",
  "summary.pdfTerms.included.seating",
  "summary.pdfTerms.included.changingRooms",
  "summary.pdfTerms.included.parking",
  "summary.pdfTerms.included.elevator",
  "summary.pdfTerms.included.dining",
] as const;

const PDF_TERMS_SEPARATE = [
  "summary.pdfTerms.separate.decor",
  "summary.pdfTerms.separate.menuExtras",
  "summary.pdfTerms.separate.addOns",
] as const;

export const PackagePdfNotes = () => {
  const { t } = useT();
  return (
    <div className="print-only mt-3 border-t border-muted-foreground/20 pt-3 text-xs leading-relaxed text-foreground/90">
      <p className="font-semibold text-foreground">{t("summary.pdfTerms.includedHeading")}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4">
        {PDF_TERMS_INCLUDED.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>

      <p className="mt-3 font-semibold text-foreground">{t("summary.pdfTerms.separateHeading")}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4">
        {PDF_TERMS_SEPARATE.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {t("summary.pdfTerms.footer")}
      </p>
    </div>
  );
};

export const DjPdfSuggestion = () => {
  const { t } = useT();
  const djPrice = formatINR(
    EXTRA_SERVICES.find((e) => e.id === DJ_EXTRA_ID)?.price ?? 6000,
  );
  return (
    <p className="print-only rounded-md border border-primary/30 bg-primary/5 p-3 text-xs font-medium leading-relaxed text-foreground">
      {t("summary.pdfDjSuggestion").replace("{price}", djPrice)}
    </p>
  );
};

export const SummaryField = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className={highlight ? "text-lg font-semibold text-primary" : "font-medium text-foreground"}>
      {value}
    </div>
  </div>
);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatEventDate = (iso: string): string => {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const idx = Math.max(0, Math.min(11, Number(mo) - 1));
  return `${d} ${MONTHS[idx]} ${y}`;
};

export const formatTiming = (s: EnquiryState): string => {
  const pkg = PACKAGES.find((p) => p.id === s.packageId);
  const slot = pkg?.slots?.find((sl) => sl.id === s.slotId) || pkg?.slots?.[0];
  if (!slot) return "—";
  const re = /(\d{1,2}:\d{2}\s?[APap][Mm])\s*[–-]\s*(\d{1,2}:\d{2}\s?[APap][Mm])/;
  const m = re.exec(slot.label);
  if (m) return `${m[1]} to ${m[2]}`;
  return slot.label;
};

export const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium tabular-nums">{value}</span>
  </div>
);

export const SelectionsBreakdown = ({
  state,
  menuOnly = false,
}: {
  state: EnquiryState;
  menuOnly?: boolean;
}) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  const venue = VENUE_OPTIONS.find((v) => v.id === state.venueId);
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  const stage = STAGE_OPTIONS.find((s) => s.id === state.stageId);
  const decors = DECOR_OPTIONS.filter((d) => state.decorIds.includes(d.id));
  const extras = EXTRA_SERVICES.filter((e) => state.extraIds.includes(e.id));

  const selectedMenu = MENU_ITEMS.filter((m) => state.menuItemIds.includes(m.id));
  const menuByCat = selectedMenu.reduce<Record<string, typeof MENU_ITEMS>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});
  const summaryIncludedIds = plate
    ? getIncludedMenuItemIds(state.menuItemIds, plate.limits)
    : new Set<string>();

  const sections: { title: string; body: React.ReactNode; key: string }[] = [];

  if (!menuOnly && venue) {
    sections.push({
      key: "venue",
      title: t("section.venue"),
      body: (
        <div className="text-sm">
          <span className="font-medium">{venue.name}</span>
        </div>
      ),
    });
  }

  if (!menuOnly && pkg) {
    const slot = pkg.slots?.[0];
    sections.push({
      key: "package",
      title: t("section.package"),
      body: (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">{pkg.name}</span>
            {slot && (
              <span className="text-muted-foreground"> · {slot.label} ({slot.hours}h)</span>
            )}
          </div>
          {pkg.tagline && (
            <div className="text-xs italic text-muted-foreground">{pkg.tagline}</div>
          )}
          {pkg.perks?.length > 0 && (
            <ul className="no-print space-y-0.5 text-xs text-muted-foreground">
              {pkg.perks.map((perk) => (
                <li key={perk}>• {perk}</li>
              ))}
            </ul>
          )}
          <PackagePdfNotes />
        </div>
      ),
    });
  }

  sections.push({
    key: "plateCompare",
    title: t("section.platePackages"),
    body: <PlatePackageComparison selectedId={state.platePackageId} />,
  });

  if (plate) {
    sections.push({
      key: "menu",
      title: t("section.menuPlate"),
      body: (
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">{plate.name}</span>
            {plate.basePrice > 0 && (
              <span className="text-muted-foreground"> · ₹{plate.basePrice}/plate base</span>
            )}
            {plate.minPax != null && (
              <span className="text-muted-foreground">
                {" "}
                · {t("menu.minPax").replace("{n}", String(plate.minPax))}
              </span>
            )}
          </div>

          <MenuPackageAlerts
            platePackageId={state.platePackageId}
            menuItemIds={state.menuItemIds}
            selectMenuLater={state.selectMenuLater}
            isMenuSelection={menuOnly}
            showSelectLaterSummary={!menuOnly}
          />

          {!(state.selectMenuLater && !menuOnly) &&
            (Object.keys(menuByCat).length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("summary.noDishes")}</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(menuByCat).map(([cat, items]) => {
                  const limit = (plate.limits as Record<string, number>)[cat] ?? 0;
                  const isSwappable = isSwappableMenuCategory(cat);
                  const extraCount = items.filter((m) => !summaryIncludedIds.has(m.id)).length;
                  return (
                    <div
                      key={cat}
                      className={`rounded-md border p-2 ${extraCount > 0 ? "border-amber-300 bg-amber-50/50" : "bg-muted/30"}`}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {menuLabels.categoryName(cat)}
                        {!isSwappable && limit > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                            {Math.min(items.length, limit)}/{limit} {t("menu.included")}
                          </span>
                        )}
                        {isSwappable && items.length > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                            {items.length} {t("menu.selected")}
                          </span>
                        )}
                        {extraCount > 0 && (
                          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                            +{extraCount} {t("menu.extra")}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-0.5">
                        {items.map((m) => {
                          const beyondPackage = !summaryIncludedIds.has(m.id);
                          return (
                            <li
                              key={m.id}
                              className={`flex items-center justify-between gap-2 rounded px-1 py-0.5 text-xs ${
                                beyondPackage ? "bg-amber-100/80 font-medium text-amber-950" : ""
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {menuLabels.itemName(m)}
                                {beyondPackage && (
                                  <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                                    {t("menu.extra")}
                                  </span>
                                )}
                              </span>
                              <span
                                className={
                                  beyondPackage
                                    ? "font-semibold text-amber-800 tabular-nums"
                                    : "text-muted-foreground"
                                }
                              >
                                {beyondPackage
                                  ? m.category === "Live Counters" && m.subcategory
                                    ? getLiveCounterExtraLabel(m.subcategory)
                                    : `+₹${getItemExtraPrice(m)}/plate`
                                  : t("menu.included")}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      ),
    });
  }

  if (!menuOnly && decors.length > 0) {
    sections.push({
      key: "decor",
      title: t("section.decoration"),
      body: (
        <ul className="space-y-1 text-sm">
          {decors.map((d) => (
            <li key={d.id} className="flex items-center justify-between">
              <span>{d.name}</span>
              <span className="text-muted-foreground tabular-nums">{formatINR(d.price)}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (!menuOnly && stage) {
    sections.push({
      key: "stage",
      title: t("section.stage"),
      body: (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stage.name}</span>
          <span className="text-muted-foreground tabular-nums">{formatINR(stage.price)}</span>
        </div>
      ),
    });
  }

  if (!menuOnly && extras.length > 0) {
    sections.push({
      key: "extras",
      title: t("section.extras"),
      body: (
        <ul className="space-y-1 text-sm">
          {extras.map((e) => (
            <li key={e.id} className="flex items-center justify-between">
              <span>
                {e.name} <span className="text-xs text-muted-foreground">({e.unit})</span>
              </span>
              <span className="text-muted-foreground tabular-nums">{formatINR(e.price)}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (sections.length === 0) return null;

  const plateCompareSection = sections.find((s) => s.key === "plateCompare");
  const menuSection = sections.find((s) => s.key === "menu");
  const otherSections = sections.filter((s) => s.key !== "menu" && s.key !== "plateCompare");

  const renderSection = (
    sec: { title: string; body: React.ReactNode; key: string },
    fullWidth = false,
  ) => (
    <div key={sec.key} className={`rounded-lg border bg-white p-3 ${fullWidth ? "md:col-span-2" : ""}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{sec.title}</div>
      {sec.body}
    </div>
  );

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("summary.selectionDetails")}
      </h3>
      <div className="grid gap-3 md:grid-cols-2 md:items-start">
        {plateCompareSection ? renderSection(plateCompareSection, true) : null}
        <div className="space-y-3">{menuSection ? renderSection(menuSection) : null}</div>
        <div className="space-y-3">{otherSections.map((sec) => renderSection(sec))}</div>
      </div>
    </div>
  );
};

export const EnquiryPdfDocument = ({
  state,
  menuOnly = false,
  notesAsPlainText = false,
}: {
  state: EnquiryState;
  menuOnly?: boolean;
  notesAsPlainText?: boolean;
}) => {
  const { t } = useT();
  const totals = calcTotals(state);

  return (
    <div className="space-y-6 bg-white text-foreground">
      {!menuOnly && (
        <div className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
          <SummaryField label={t("summary.customer")} value={state.basics.customerName || "—"} />
          <SummaryField label={t("summary.phone")} value={state.basics.phone || "—"} />
          <SummaryField label={t("summary.event")} value={state.basics.eventType || "—"} />
          <SummaryField label={t("summary.date")} value={formatEventDate(state.basics.eventDate)} highlight />
          <SummaryField label={t("summary.timing")} value={formatTiming(state)} highlight />
          <SummaryField label={t("summary.guests")} value={String(state.basics.guestCount || 0)} />
          <SummaryField label={t("summary.source")} value={state.basics.source || "—"} />
        </div>
      )}

      <SelectionsBreakdown state={state} menuOnly={menuOnly} />

      {!menuOnly && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-noir p-6 text-white shadow-gold [&_.text-muted-foreground]:text-white/70 [&_.tabular-nums]:text-white">
          <span
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-gold opacity-20 blur-3xl"
          />
          <Row label={t("summary.subtotal")} value={formatINR(totals.subtotal)} />
          {totals.discount > 0 && (
            <Row label={t("summary.discount")} value={`- ${formatINR(totals.discount)}`} />
          )}
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="font-display text-base font-semibold uppercase tracking-wider text-white/80">
              {t("summary.grandTotal")}
            </span>
            <span className="font-display text-3xl font-bold text-gradient-gold tabular-nums">
              {formatINR(totals.total)}
            </span>
          </div>
        </div>
      )}

      {!menuOnly && state.notes && (
        notesAsPlainText ? (
          <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">{state.notes}</div>
        ) : (
          <div
            className="print-only rounded-md border p-3 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: state.notes }}
          />
        )
      )}

      {!menuOnly && !state.extraIds.includes(DJ_EXTRA_ID) && <DjPdfSuggestion />}
    </div>
  );
};

export const buildEnquiryPdfFilename = (
  state: EnquiryState,
  options?: { prefix?: string; menuSelection?: boolean },
): string => {
  const sanitize = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  const prefix = options?.prefix ?? "Enquiry";
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  const safeName = sanitize(
    options?.menuSelection
      ? plate?.name || "MenuSelection"
      : state.basics.customerName || "Customer",
  );
  const safeEvent = sanitize(options?.menuSelection ? "" : state.basics.eventType || "");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return [prefix, safeName, safeEvent, timestamp].filter(Boolean).join("_") + ".pdf";
};
