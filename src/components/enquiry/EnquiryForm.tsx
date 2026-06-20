import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionCard } from "./SectionCard";
import { SelectableCard } from "./SelectableCard";
import { PlatePackageComparison } from "./PlatePackageComparison";
import { MenuPackageAlerts } from "./MenuPackageAlerts";
import { RichTextEditor } from "./RichTextEditor";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  PACKAGES, MENU_ITEMS, PLATE_PACKAGES, DECOR_OPTIONS, STAGE_OPTIONS,
  CHAIR_OPTIONS, EXTRA_SERVICES, VENUE_OPTIONS, getDefaultVenueId, EVENT_TYPES, SOURCES, APPROX_BUDGET_RANGES, DJ_EXTRA_ID,
  getIncludedMenuItemIds, getItemExtraPrice, getCategoryExtraPrice,
  getLiveCounterExtraLabel, getMenuSubcategoryErrors, LIVE_COUNTER_RULES,
  filterMenuIdsForPackage, getMenuItemsForPackage,
  isSwappableMenuCategory, getSwappablePoolLimit, getSwappablePoolStatus,
  SWAPPABLE_MENU_CATEGORIES,
} from "@/data/enquiryOptions";
import { initialEnquiry, type EnquiryState } from "@/types/enquiry";
import { calcTotals, formatINR } from "@/lib/enquiryTotals";
import { buildEnquiryLeadPayload, submitEnquiryLead } from "@/lib/enquiryApi";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import {
  buildEnquiryPdfFilename,
  DjPdfSuggestion,
  formatEventDate,
  formatTiming,
  Row,
  SelectionsBreakdown,
  SummaryField,
} from "./EnquiryPdfSummary";
import { ArrowLeft, ArrowRight, Printer, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";

const ENQUIRY_TABS = [
  "basics", "venue", "package", "menu", "stage", "extras", "summary",
] as const;
const MENU_SELECTION_TABS = ["menu", "summary"] as const;

export type EnquiryFormVariant = "enquiry" | "menu-selection";

type EnquiryTabKey = typeof ENQUIRY_TABS[number];
type MenuSelectionTabKey = typeof MENU_SELECTION_TABS[number];
type TabKey = EnquiryTabKey | MenuSelectionTabKey;

const TAB_KEYS: Record<TabKey, string> = {
  basics: "tab.basics",
  venue: "tab.venue",
  package: "tab.package",
  menu: "tab.menu",
  stage: "tab.stage",
  extras: "tab.extras",
  summary: "tab.summary",
};

const toggle = (arr: string[], id: string) =>
  arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

const Req = () => <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>;

const NAME_RE = /^[\p{L}\p{M}\s.\-']+$/u;
const validateName = (raw: string, t: (k: string) => string): string | null => {
  const v = raw.trim();
  if (!v) return t("validate.nameRequired");
  if (v.length < 2) return t("validate.nameShort");
  if (!NAME_RE.test(v)) return t("validate.nameInvalid");
  return null;
};
const validatePhone = (raw: string, t: (k: string) => string): string | null => {
  const v = raw.trim();
  if (!v) return t("validate.phoneRequired");
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return t("validate.phoneInvalid");
  return null;
};

export const EnquiryForm = ({ variant = "enquiry" }: { variant?: EnquiryFormVariant }) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const TAB_ORDER = (variant === "menu-selection" ? MENU_SELECTION_TABS : ENQUIRY_TABS) as readonly TabKey[];
  const isMenuSelection = variant === "menu-selection";
  const [tab, setTab] = useState<TabKey>(isMenuSelection ? "menu" : "basics");
  const [state, setState] = useState<EnquiryState>(() => ({
    ...initialEnquiry,
    venueId: getDefaultVenueId(),
    ...(isMenuSelection
      ? { packageId: "", stageId: "", chairId: "", decorIds: [], extraIds: [], selectMenuLater: false }
      : { selectMenuLater: true }),
  }));
  const [touched, setTouched] = useState<{ customerName?: boolean; phone?: boolean }>({});
  const [attempted, setAttempted] = useState<Set<TabKey>>(new Set());
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const totals = calcTotals(state);

  const update = <K extends keyof EnquiryState>(key: K, value: EnquiryState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const updateBasic = <K extends keyof EnquiryState["basics"]>(key: K, value: EnquiryState["basics"][K]) =>
    setState((s) => ({ ...s, basics: { ...s.basics, [key]: value } }));

  const idx = TAB_ORDER.indexOf(tab);
  const nameError = validateName(state.basics.customerName, t);
  const phoneError = validatePhone(state.basics.phone, t);
  const b = state.basics;
  const showBasics = attempted.has("basics");
  const tomorrowISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  })();
  const isPastOrToday = (v: string) => !!v && v < tomorrowISO;
  const err = {
    name:      (touched.customerName || showBasics) ? nameError : null,
    phone:     (touched.phone || showBasics)        ? phoneError : null,
    eventType: !isMenuSelection && showBasics && !b.eventType  ? t("validate.eventTypeRequired") : null,
    eventDate: showBasics
      ? (!b.eventDate
          ? t("validate.eventDateRequired")
          : isPastOrToday(b.eventDate)
            ? t("validate.eventDateFuture")
            : null)
      : null,
    guests:    showBasics && !b.guestCount ? t("validate.guestsRequired")    : null,
    source:    !isMenuSelection && showBasics && !b.source     ? t("validate.sourceRequired")    : null,
  };
  const invalidVenue   = attempted.has("venue")   && !state.venueId;
  const invalidPackage = attempted.has("package") && !state.packageId;
  const invalidStage   = attempted.has("stage")   && !state.stageId;
  const menuPlateMissing = attempted.has("menu") && !state.platePackageId;
  const selectedPlate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  const selectedPlateLimits = (selectedPlate?.limits ?? {}) as Record<string, number>;
  const swappablePool = getSwappablePoolStatus(state.menuItemIds, selectedPlateLimits);
  const invalidCats = new Set<string>();
  if (attempted.has("menu") && !state.selectMenuLater && state.platePackageId) {
    if (!swappablePool.isComplete) {
      SWAPPABLE_MENU_CATEGORIES.forEach((cat) => invalidCats.add(cat));
    }
    for (const [cat, limit] of Object.entries(selectedPlateLimits)) {
      if (!limit || isSwappableMenuCategory(cat)) continue;
      const sel = MENU_ITEMS.filter((m) => m.category === cat && state.menuItemIds.includes(m.id)).length;
      if (sel < limit) invalidCats.add(cat);
    }
  }
  const menuIncludedIds = getIncludedMenuItemIds(state.menuItemIds, selectedPlateLimits);
  const validateTab = (key: TabKey): string[] => {
    const errs: string[] = [];
    switch (key) {
      case "basics": {
        const b = state.basics;
        if (nameError) errs.push(nameError);
        if (phoneError) errs.push(phoneError);
        if (!isMenuSelection && !b.eventType)  errs.push(t("validate.eventTypeRequired"));
        if (!b.eventDate)  errs.push(t("validate.eventDateRequired"));
        else if (isPastOrToday(b.eventDate)) errs.push(t("validate.eventDateFuture"));
        if (!b.guestCount) errs.push(t("validate.guestsRequired"));
        if (!isMenuSelection && !b.source)     errs.push(t("validate.sourceRequired"));
        break;
      }
      case "venue":   if (!state.venueId)   errs.push(t("toast.needVenue"));   break;
      case "package": if (!state.packageId) errs.push(t("toast.needPackage")); break;
      case "menu": {
        if (!state.platePackageId) {
          errs.push(t("toast.needPlatePackage"));
          break;
        }
        if (state.selectMenuLater && !isMenuSelection) break;
        if (state.menuItemIds.length === 0) errs.push(t("toast.needPlate"));
        const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
        const limits = (plate?.limits ?? {}) as Record<string, number>;
        const pool = getSwappablePoolStatus(state.menuItemIds, limits);
        if (!pool.isComplete) {
          errs.push(
            t("toast.needSwappablePool")
              .replace("{n}", String(pool.required))
              .replace("{selected}", String(pool.selected)),
          );
        }
        for (const [cat, limit] of Object.entries(limits)) {
          if (!limit || isSwappableMenuCategory(cat)) continue;
          const selected = MENU_ITEMS.filter(
            (m) => m.category === cat && state.menuItemIds.includes(m.id),
          ).length;
          if (selected < limit) {
            errs.push(
              t("toast.needMenuIncluded").replace("{cat}", menuLabels.categoryName(cat)).replace("{n}", String(limit)),
            );
          }
        }
        getMenuSubcategoryErrors(state.menuItemIds).forEach((e) => errs.push(e.message));
        break;
      }
      case "stage": if (!state.stageId) errs.push(t("toast.needStage")); break;
    }
    return errs;
  };
  const tryChangeTab = async (next: TabKey) => {
    if (next === tab) return;
    const nextIdx = TAB_ORDER.indexOf(next);
    if (nextIdx < idx) { setTab(next); return; }
    let firstBadTab: TabKey | null = null;
    const allErrs: string[] = [];
    const badTabs: TabKey[] = [];
    for (let i = idx; i < nextIdx; i++) {
      const errs = validateTab(TAB_ORDER[i]);
      if (errs.length) {
        firstBadTab ??= TAB_ORDER[i];
        badTabs.push(TAB_ORDER[i]);
        allErrs.push(...errs);
      }
    }
    if (firstBadTab) {
      setAttempted((prev) => {
        const n = new Set(prev);
        badTabs.forEach((k) => n.add(k));
        return n;
      });
      if (firstBadTab === "basics") setTouched({ customerName: true, phone: true });
      if (firstBadTab !== tab) setTab(firstBadTab);
      toast.error(t("toast.fixErrors"), {
        description: (
          <ul className="ml-4 list-disc space-y-0.5 text-white">
            {allErrs.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        ),
      });
      return;
    }

    const menuIdx = TAB_ORDER.indexOf("menu");
    const leavingMenuForward = idx === menuIdx && nextIdx > menuIdx;
    if (leavingMenuForward && !isMenuSelection && !state.leadApiResponse) {
      setIsSubmittingLead(true);
      try {
        const response = await submitEnquiryLead(buildEnquiryLeadPayload(state));
        setState((s) => ({ ...s, leadApiResponse: response }));
        setTab(next);
      } catch {
        toast.error(t("toast.leadSubmitFailed"));
      } finally {
        setIsSubmittingLead(false);
      }
      return;
    }

    setTab(next);
  };
  const goNext = () => {
    if (idx < TAB_ORDER.length - 1) void tryChangeTab(TAB_ORDER[idx + 1]);
  };
  const goPrev = () => {
    if (idx > 0) void tryChangeTab(TAB_ORDER[idx - 1]);
  };

  const menuByCategory = MENU_ITEMS.reduce<Record<string, typeof MENU_ITEMS>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});

  const handleDownloadPdf = async () => {
    if (!isMenuSelection && !state.basics.customerName) {
      toast.error(t("toast.needCustomer"));
      return;
    }
    const element = document.getElementById("print-area");
    if (!element) return;
    const filename = buildEnquiryPdfFilename(state, {
      prefix: isMenuSelection ? "MenuSelection" : "Enquiry",
      menuSelection: isMenuSelection,
    });
    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(element, filename);
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
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => void tryChangeTab(v as TabKey)}>
        <div className="no-print -mx-1 overflow-x-auto sm:mx-0">
          <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft sm:flex-wrap sm:w-full">
            {TAB_ORDER.map((k, i) => (
              <TabsTrigger
                key={k}
                value={k}
                className="group shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold sm:text-sm"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                  {i + 1}
                </span>
                {t(TAB_KEYS[k])}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* PACKAGE */}
        {!isMenuSelection && (
        <TabsContent value="package" className="mt-6">
          <SectionCard title={t("package.title")} description={t("package.desc")} required>
            {invalidPackage && (
              <p className="mb-3 text-sm text-destructive">{t("toast.needPackage")}</p>
            )}
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${invalidPackage ? "rounded-lg p-2 ring-2 ring-destructive/60" : ""}`}>
              {(() => {
                return PACKAGES.map((p) => {
                  const hours = p.slots?.[0]?.hours ?? 0;
                  const label = p.slots?.[0]?.label ?? p.tagline;
                  const subtitle = hours ? `${label} · ${hours}h` : label;
                  return (
                <SelectableCard
                  key={p.id}
                  selected={state.packageId === p.id}
                  onClick={() => { if (state.packageId !== p.id) update("packageId", p.id); }}
                  title={p.name}
                  subtitle={subtitle}
                >
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {p.perks.map((perk) => (
                      <li key={perk}>• {perk}</li>
                    ))}
                  </ul>
                </SelectableCard>
                  );
                });
              })()}
            </div>
          </SectionCard>
        </TabsContent>
        )}

        {/* BASIC DETAILS */}
        {!isMenuSelection && (
        <TabsContent value="basics" className="mt-6">
          <SectionCard
            title={t("basics.title")}
            description={isMenuSelection ? t("menuSelection.basicsDesc") : t("basics.desc")}
            required
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("basics.customerName")}<Req /></Label>
                <Input
                  value={state.basics.customerName}
                  onChange={(e) => updateBasic("customerName", e.target.value.slice(0, 100))}
                  onBlur={() => setTouched((x) => ({ ...x, customerName: true }))}
                  aria-invalid={!!err.name}
                  className={err.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder={t("basics.customerName.ph")}
                />
                {err.name && <p className="text-xs text-destructive">{err.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("basics.phone")}<Req /></Label>
                <Input
                  inputMode="tel"
                  value={state.basics.phone}
                  onChange={(e) => updateBasic("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
                  aria-invalid={!!err.phone}
                  className={err.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="9876543210"
                  maxLength={10}
                />
                {err.phone && <p className="text-xs text-destructive">{err.phone}</p>}
              </div>
              {!isMenuSelection && (
              <div className="space-y-2">
                <Label>{t("basics.eventType")}<Req /></Label>
                <Select value={state.basics.eventType} onValueChange={(v) => updateBasic("eventType", v)}>
                  <SelectTrigger aria-invalid={!!err.eventType} className={err.eventType ? "border-destructive" : ""}><SelectValue placeholder={t("basics.eventType.ph")} /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                {err.eventType && <p className="text-xs text-destructive">{err.eventType}</p>}
              </div>
              )}
              <div className="space-y-2">
                <Label>{t("basics.eventDate")}<Req /></Label>
                <Input
                  type="date"
                  min={tomorrowISO}
                  value={state.basics.eventDate}
                  onChange={(e) => updateBasic("eventDate", e.target.value)}
                  aria-invalid={!!err.eventDate}
                  className={err.eventDate ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {err.eventDate && <p className="text-xs text-destructive">{err.eventDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("basics.guests")}<Req /></Label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={state.basics.guestCount}
                  onChange={(e) => updateBasic("guestCount", Math.max(0, Math.min(10000, Number(e.target.value) || 0)))}
                  aria-invalid={!!err.guests}
                  className={err.guests ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {err.guests && <p className="text-xs text-destructive">{err.guests}</p>}
              </div>
              {!isMenuSelection && (
              <div className="space-y-2">
                <Label>{t("basics.source")}<Req /></Label>
                <Select value={state.basics.source} onValueChange={(v) => updateBasic("source", v)}>
                  <SelectTrigger aria-invalid={!!err.source} className={err.source ? "border-destructive" : ""}><SelectValue placeholder={t("basics.source.ph")} /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {err.source && <p className="text-xs text-destructive">{err.source}</p>}
              </div>
              )}
              {!isMenuSelection && (
              <div className="space-y-2">
                <Label>{t("basics.approxBudget")}</Label>
                <Select value={state.basics.approxBudget} onValueChange={(v) => updateBasic("approxBudget", v)}>
                  <SelectTrigger><SelectValue placeholder={t("basics.approxBudget.ph")} /></SelectTrigger>
                  <SelectContent>
                    {APPROX_BUDGET_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>
        )}

        {/* VENUE */}
        {!isMenuSelection && (
        <TabsContent value="venue" className="mt-6">
          <SectionCard title={t("venue.title")} description={t("venue.desc")} required>
            {invalidVenue && (
              <p className="mb-3 text-sm text-destructive">{t("toast.needVenue")}</p>
            )}
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${invalidVenue ? "rounded-lg p-2 ring-2 ring-destructive/60" : ""}`}>
              {VENUE_OPTIONS.map((v) => (
                <SelectableCard
                  key={v.id}
                  selected={state.venueId === v.id}
                  onClick={() => update("venueId", state.venueId === v.id ? "" : v.id)}
                  title={v.name}
                  subtitle={v.description}
                />
              ))}
            </div>
          </SectionCard>
        </TabsContent>
        )}

        {/* MENU */}
        <TabsContent value="menu" className="mt-6">
          <SectionCard title={t("menu.title")} description={t("menu.desc")} required>
            {!state.platePackageId && !menuPlateMissing && (
              <p className="mb-3 text-sm text-muted-foreground">{t("menu.selectPlatePackage")}</p>
            )}
            {menuPlateMissing && (
              <p className="mb-3 text-sm text-destructive">{t("toast.needPlatePackage")}</p>
            )}
            <div className="mb-6">
              <PlatePackageComparison
                selectedId={state.platePackageId}
                invalid={menuPlateMissing}
                onSelect={(newId) => {
                  update("platePackageId", newId);
                  update(
                    "menuItemIds",
                    newId ? filterMenuIdsForPackage(state.menuItemIds, newId) : [],
                  );
                }}
              />
            </div>

            <MenuPackageAlerts
              platePackageId={state.platePackageId}
              menuItemIds={state.menuItemIds}
              selectMenuLater={state.selectMenuLater}
              isMenuSelection={isMenuSelection}
              swappableInvalid={
                invalidCats.size > 0 &&
                SWAPPABLE_MENU_CATEGORIES.some((c) => invalidCats.has(c))
              }
              className="mb-4"
            />

            {state.platePackageId && !isMenuSelection && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <Checkbox
                id="select-menu-later"
                checked={state.selectMenuLater}
                onCheckedChange={(checked) => {
                  const on = checked === true;
                  setState((s) => ({
                    ...s,
                    selectMenuLater: on,
                    ...(on ? { menuItemIds: [] } : {}),
                  }));
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="select-menu-later" className="cursor-pointer font-medium leading-none">
                  {t("menu.selectLater")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("menu.selectLaterDesc")}</p>
              </div>
            </div>
            )}

            {!isMenuSelection && state.selectMenuLater && state.platePackageId && (
              <p className="mb-4 text-sm text-muted-foreground italic">{t("menu.selectLaterHint")}</p>
            )}

            {(!state.selectMenuLater || isMenuSelection) && (
              !state.platePackageId ? (
              <p className="text-sm text-muted-foreground">{t("menu.selectPlate")}</p>
            ) : (
            <Accordion
              {...(isMenuSelection
                ? { type: "single" as const, collapsible: true }
                : { type: "multiple" as const, defaultValue: [] })}
              className="w-full"
            >
              {Object.entries(menuByCategory)
                .filter(([cat]) => {
                  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
                  if (!plate) return false;
                  if (plate.id === "plate-custom") return true;
                  if (isSwappableMenuCategory(cat)) {
                    return getSwappablePoolLimit(plate.limits) > 0;
                  }
                  return ((plate.limits as Record<string, number>)[cat] ?? 0) > 0;
                })
                .map(([cat, items]) => {
                const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
                const limit = (plate?.limits as Record<string, number> | undefined)?.[cat] ?? 0;
                const isSwappable = isSwappableMenuCategory(cat);
                const catItems = state.platePackageId
                  ? getMenuItemsForPackage(state.platePackageId, cat)
                  : items;
                const selectedItems = catItems.filter((m) => state.menuItemIds.includes(m.id));
                const selectedCount = selectedItems.length;
                const extraCount = selectedItems.filter((m) => !menuIncludedIds.has(m.id)).length;
                const catInvalid = invalidCats.has(cat);
                return (
                  <AccordionItem key={cat} value={cat} className={`border-b-0 mb-2 overflow-hidden rounded-lg border bg-white ${catInvalid ? "ring-2 ring-destructive/60" : ""}`}>
                    <AccordionTrigger className="bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline">
                      <span className="flex items-center gap-2">
                        {menuLabels.categoryName(cat)}
                        {isSwappable ? (
                          selectedCount > 0 && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {selectedCount} {t("menu.selected")}
                            </span>
                          )
                        ) : limit > 0 ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catInvalid ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                            {Math.min(selectedCount, limit)}/{limit} {t("menu.included")}
                          </span>
                        ) : (
                          selectedCount > 0 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              {selectedCount} {t("menu.selected")}
                            </span>
                          )
                        )}
                        {extraCount > 0 && (
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
                      {(() => {
                        const hasSub = catItems.some((m) => m.subcategory);
                        const groups: Record<string, typeof catItems> = {};
                        catItems.forEach((m) => {
                          const key = m.subcategory || "";
                          (groups[key] ||= []).push(m);
                        });
                        const renderCard = (m: typeof catItems[number]) => {
                          const isSel = state.menuItemIds.includes(m.id);
                          const isExtra = isSel && !menuIncludedIds.has(m.id);
                          const priceLabel = isExtra
                            ? m.category === "Live Counters"
                              ? t("menu.extraCounter")
                              : `+₹${getItemExtraPrice(m)}/plate (extra)`
                            : t("menu.included");
                          return (
                            <SelectableCard
                              key={m.id}
                              selected={isSel}
                              onClick={() => update("menuItemIds", toggle(state.menuItemIds, m.id))}
                              title={menuLabels.itemName(m)}
                              price={priceLabel}
                              subtitle={isExtra ? t("menu.beyondLimit") : undefined}
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
                          <Accordion
                            {...(isMenuSelection
                              ? { type: "single" as const, collapsible: true }
                              : { type: "multiple" as const, defaultValue: [] })}
                            className="w-full pt-3"
                          >
                            {Object.entries(groups).map(([sub, subItems]) => {
                              const subSelCount = subItems.filter((m) => state.menuItemIds.includes(m.id)).length;
                              const subHasExtra = subItems.some(
                                (m) => state.menuItemIds.includes(m.id) && !menuIncludedIds.has(m.id),
                              );
                              const subRule = sub ? LIVE_COUNTER_RULES[sub] : undefined;
                              return (
                                <AccordionItem
                                  key={sub}
                                  value={sub}
                                  className="border-b-0 mb-2 overflow-hidden rounded-md border bg-white"
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
                      })()}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            )
            )}
          </SectionCard>
        </TabsContent>

        {/* DECOR */}
        {/* STAGE */}
        {!isMenuSelection && (
        <>
        <TabsContent value="stage" className="mt-6">
          <SectionCard title={t("stage.title")} description={t("stage.desc")} required>
            {invalidStage && (
              <p className="mb-3 text-sm text-destructive">{t("toast.needStage")}</p>
            )}
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${invalidStage ? "rounded-lg p-2 ring-2 ring-destructive/60" : ""}`}>
              {STAGE_OPTIONS.map((s) => (
                <SelectableCard
                  key={s.id}
                  selected={state.stageId === s.id}
                  onClick={() => update("stageId", state.stageId === s.id ? "" : s.id)}
                  title={s.name}
                  subtitle={s.description}
                  price={formatINR(s.price)}
                />
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* EXTRAS */}
        <TabsContent value="extras" className="mt-6">
          <SectionCard title={t("extras.title")} description={t("extras.desc")}>
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              <AccordionItem value="decoration" className="border-b-0 mb-2 overflow-hidden rounded-lg border bg-white">
                <AccordionTrigger className="bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline">
                  <span className="flex items-center gap-2">
                    {t("decor.title")}
                    {state.decorIds.length > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {state.decorIds.length} {t("menu.selected")}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="bg-white px-4 pb-4">
                  {(() => {
                    const ev = state.basics.eventType;
                    const list = ev
                      ? DECOR_OPTIONS.filter((d) => !d.events || d.events.includes(ev))
                      : DECOR_OPTIONS;
                    if (list.length === 0) {
                      return <p className="pt-3 text-sm text-muted-foreground">{t("decor.none")}</p>;
                    }
                    return (
                      <div className="grid gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((d) => (
                          <SelectableCard
                            key={d.id}
                            selected={state.decorIds.includes(d.id)}
                            onClick={() => update("decorIds", toggle(state.decorIds, d.id))}
                            title={d.name}
                            subtitle={d.description}
                            price={formatINR(d.price)}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="services" className="border-b-0 mb-2 overflow-hidden rounded-lg border bg-white">
                <AccordionTrigger className="bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline">
                  <span className="flex items-center gap-2">
                    {t("extras.title")}
                    {state.extraIds.length > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {state.extraIds.length} {t("menu.selected")}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="bg-white px-4 pb-4">
                  {!state.extraIds.includes(DJ_EXTRA_ID) && (
                    <p className="mb-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                      {t("extras.djSuggestion").replace("{price}", formatINR(
                        EXTRA_SERVICES.find((e) => e.id === DJ_EXTRA_ID)?.price ?? 6000,
                      ))}
                    </p>
                  )}
                  <div className="grid gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                    {EXTRA_SERVICES.map((e) => (
                      <SelectableCard
                        key={e.id}
                        selected={state.extraIds.includes(e.id)}
                        onClick={() => update("extraIds", toggle(state.extraIds, e.id))}
                        title={e.name}
                        subtitle={e.unit}
                        price={formatINR(e.price)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SectionCard>
        </TabsContent>
        </>
        )}

        {/* SUMMARY */}
        <TabsContent value="summary" className="mt-6">
          <SectionCard title={t("summary.title")} description={t("summary.desc")}>
            <div id="print-area" className="space-y-6">
              {!isMenuSelection && (
              <div className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
                <SummaryField label={t("summary.customer")} value={state.basics.customerName || "—"} />
                <SummaryField label={t("summary.phone")} value={state.basics.phone || "—"} />
                <SummaryField label={t("summary.event")} value={state.basics.eventType || "—"} />
                <SummaryField label={t("summary.date")} value={formatEventDate(state.basics.eventDate)} highlight />
                <SummaryField label={t("summary.timing")} value={formatTiming(state)} highlight />
                <SummaryField label={t("summary.guests")} value={String(state.basics.guestCount || 0)} />
                <SummaryField label={t("summary.source")} value={state.basics.source || "—"} />
                <SummaryField
                  label={t("summary.approxBudget")}
                  value={state.basics.approxBudget || "—"}
                />
              </div>
              )}

              <SelectionsBreakdown state={state} menuOnly={isMenuSelection} />

              {!isMenuSelection && (
              <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-noir p-6 text-white shadow-gold [&_.text-muted-foreground]:text-white/70 [&_.tabular-nums]:text-white">
                <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
                <Row label={t("summary.subtotal")} value={formatINR(totals.subtotal)} />
                <div className="mt-1 flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t("summary.discount").replace(" (%)", "")}</span>
                    <div className="inline-flex overflow-hidden rounded-md border border-white/20 no-print">
                      <button
                        type="button"
                        onClick={() => update("discountType", "percent")}
                        className={`h-7 px-2 text-xs font-semibold transition-colors ${state.discountType === "percent" ? "bg-gradient-gold text-primary-foreground" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                      >%</button>
                      <button
                        type="button"
                        onClick={() => update("discountType", "fixed")}
                        className={`h-7 px-2 text-xs font-semibold transition-colors ${state.discountType === "fixed" ? "bg-gradient-gold text-primary-foreground" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                      >₹</button>
                    </div>
                    {state.discountType === "percent" ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={state.discountPercent}
                        onChange={(e) => update("discountPercent", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                        className="h-7 w-20 border-white/20 bg-white/10 text-right text-white placeholder:text-white/40 focus-visible:ring-primary/50 no-print"
                      />
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        value={state.discountAmount}
                        onChange={(e) => update("discountAmount", Math.max(0, Number(e.target.value) || 0))}
                        className="h-7 w-24 border-white/20 bg-white/10 text-right text-white placeholder:text-white/40 focus-visible:ring-primary/50 no-print"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium tabular-nums text-white/90">- {formatINR(totals.discount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="font-display text-base font-semibold uppercase tracking-wider text-white/80">{t("summary.grandTotal")}</span>
                  <span className="font-display text-3xl font-bold text-gradient-gold tabular-nums">
                    {formatINR(totals.total)}
                  </span>
                </div>
              </div>
              )}

              {!isMenuSelection && (
              <div className="space-y-2">
                <Label className={!state.notes ? "no-print" : ""}>{t("summary.notes")}</Label>
                <div className="no-print">
                  <RichTextEditor
                    value={state.notes}
                    onChange={(html) => update("notes", html.slice(0, 5000))}
                    placeholder={t("summary.notes.ph")}
                  />
                </div>
                {state.notes && (
                  <div
                    className="print-only rounded-md border p-3 text-sm [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: state.notes }}
                  />
                )}
              </div>
              )}

              {!isMenuSelection && !state.extraIds.includes(DJ_EXTRA_ID) && (
                <DjPdfSuggestion />
              )}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Nav controls */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        {state.platePackageId ? (
          <div className="text-sm">
            <span className="text-muted-foreground">{t("common.runningTotal")} </span>
            <span className="font-display text-lg font-bold text-gradient-gold">{formatINR(totals.total)}</span>
          </div>
        ) : <div />}
        <div className="flex gap-2">
          <Button variant="outline" onClick={goPrev} disabled={idx === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}
          </Button>
          {tab === "summary" ? (
            <Button onClick={handleDownloadPdf} disabled={isPdfGenerating} className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
              <Printer className="mr-1 h-4 w-4" /> {isPdfGenerating ? t("toast.pdfGenerating") : t("common.downloadPdf")}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={isSubmittingLead} className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
              {isSubmittingLead ? t("common.saving") : t("common.next")} {!isSubmittingLead && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {idx === 0 && !isMenuSelection && !state.packageId && (
        <div className="no-print flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t("common.tipPackage")}
        </div>
      )}
    </div>
  );
};
