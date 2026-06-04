import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { SelectableCard } from "./SelectableCard";
import { RichTextEditor } from "./RichTextEditor";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  PACKAGES, MENU_ITEMS, PLATE_PACKAGES, COMMON_PLATE_ITEMS, DECOR_OPTIONS, STAGE_OPTIONS,
  CHAIR_OPTIONS, EXTRA_SERVICES, VENUE_OPTIONS, EVENT_TYPES, SOURCES,
} from "@/data/enquiryOptions";
import { initialEnquiry, type EnquiryState } from "@/types/enquiry";
import { calcTotals, formatINR } from "@/lib/enquiryTotals";
import { ArrowLeft, ArrowRight, Printer, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";

const TAB_ORDER = [
  "basics", "venue", "package", "menu", "stage", "extras", "summary",
] as const;
type TabKey = typeof TAB_ORDER[number];

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

export const EnquiryForm = () => {
  const { t } = useT();
  const [tab, setTab] = useState<TabKey>("basics");
  const [state, setState] = useState<EnquiryState>(initialEnquiry);
  const [touched, setTouched] = useState<{ customerName?: boolean; phone?: boolean }>({});
  const [attempted, setAttempted] = useState<Set<TabKey>>(new Set());
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
    eventType: showBasics && !b.eventType  ? t("validate.eventTypeRequired") : null,
    eventDate: showBasics
      ? (!b.eventDate
          ? t("validate.eventDateRequired")
          : isPastOrToday(b.eventDate)
            ? t("validate.eventDateFuture")
            : null)
      : null,
    guests:    showBasics && !b.guestCount ? t("validate.guestsRequired")    : null,
    source:    showBasics && !b.source     ? t("validate.sourceRequired")    : null,
  };
  const invalidVenue   = attempted.has("venue")   && !state.venueId;
  const invalidPackage = attempted.has("package") && !state.packageId;
  const invalidStage   = attempted.has("stage")   && !state.stageId;
  const menuPlateMissing = attempted.has("menu") && !state.platePackageId;
  const invalidCats = new Set<string>();
  if (attempted.has("menu") && state.platePackageId) {
    const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
    const limits = (plate?.limits ?? {}) as Record<string, number>;
    for (const [cat, limit] of Object.entries(limits)) {
      if (!limit) continue;
      const sel = MENU_ITEMS.filter((m) => m.category === cat && state.menuItemIds.includes(m.id)).length;
      if (sel < limit) invalidCats.add(cat);
    }
  }
  const validateTab = (key: TabKey): string[] => {
    const errs: string[] = [];
    switch (key) {
      case "basics": {
        const b = state.basics;
        if (nameError) errs.push(nameError);
        if (phoneError) errs.push(phoneError);
        if (!b.eventType)  errs.push(t("validate.eventTypeRequired"));
        if (!b.eventDate)  errs.push(t("validate.eventDateRequired"));
        else if (isPastOrToday(b.eventDate)) errs.push(t("validate.eventDateFuture"));
        if (!b.guestCount) errs.push(t("validate.guestsRequired"));
        if (!b.source)     errs.push(t("validate.sourceRequired"));
        break;
      }
      case "venue":   if (!state.venueId)   errs.push(t("toast.needVenue"));   break;
      case "package": if (!state.packageId) errs.push(t("toast.needPackage")); break;
      case "menu": {
        if (!state.platePackageId)              errs.push(t("toast.needPlate"));
        else if (state.menuItemIds.length === 0) errs.push(t("toast.needPlate"));
        const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
        const limits = (plate?.limits ?? {}) as Record<string, number>;
        for (const [cat, limit] of Object.entries(limits)) {
          if (!limit) continue;
          const selected = MENU_ITEMS.filter(
            (m) => m.category === cat && state.menuItemIds.includes(m.id),
          ).length;
          if (selected < limit) {
            errs.push(
              t("toast.needMenuIncluded").replace("{cat}", cat).replace("{n}", String(limit)),
            );
          }
        }
        break;
      }
      case "stage": if (!state.stageId) errs.push(t("toast.needStage")); break;
    }
    return errs;
  };
  const tryChangeTab = (next: TabKey) => {
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
    setTab(next);
  };
  const goNext = () => {
    if (idx < TAB_ORDER.length - 1) tryChangeTab(TAB_ORDER[idx + 1]);
  };
  const goPrev = () => {
    if (idx > 0) tryChangeTab(TAB_ORDER[idx - 1]);
  };

  const menuByCategory = MENU_ITEMS.reduce<Record<string, typeof MENU_ITEMS>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});

  const handleDownloadPdf = async () => {
    if (!state.basics.customerName) {
      toast.error(t("toast.needCustomer"));
      return;
    }
    const element = document.getElementById("print-area");
    if (!element) return;
    const sanitize = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    const safeName = sanitize(state.basics.customerName);
    const safeEvent = sanitize(state.basics.eventType || "");
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = ["Enquiry", safeName, safeEvent, timestamp].filter(Boolean).join("_") + ".pdf";
    try {
      document.body.classList.add("printing");
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (e) {
      toast.error(t("toast.pdfFailed"));
    } finally {
      document.body.classList.remove("printing");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => tryChangeTab(v as TabKey)}>
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

        {/* BASIC DETAILS */}
        <TabsContent value="basics" className="mt-6">
          <SectionCard title={t("basics.title")} description={t("basics.desc")} required>
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
            </div>
          </SectionCard>
        </TabsContent>

        {/* VENUE */}
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

        {/* MENU */}
        <TabsContent value="menu" className="mt-6">
          <SectionCard title={t("menu.title")} description={t("menu.desc")} required>
            {menuPlateMissing && (
              <p className="mb-3 text-sm text-destructive">{t("toast.needPlate")}</p>
            )}
            <div className={`mb-6 overflow-x-auto rounded-lg border ${menuPlateMissing ? "ring-2 ring-destructive/60" : ""}`}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="sticky left-0 z-10 bg-muted/40 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("menu.category") ?? "Category"}
                    </th>
                    {PLATE_PACKAGES.map((p) => {
                      const isSel = state.platePackageId === p.id;
                      return (
                        <th
                          key={p.id}
                          onClick={() => {
                            update("platePackageId", isSel ? "" : p.id);
                            update("menuItemIds", []);
                          }}
                          className={`min-w-[140px] cursor-pointer border-l px-3 py-3 text-center align-top transition-colors ${
                            isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          <div className="text-sm font-semibold">{p.name}</div>
                          <div className={`mt-1 text-xs ${isSel ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {p.basePrice > 0 ? `₹${p.basePrice}/plate` : "—"}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allCats = Array.from(
                      new Set(PLATE_PACKAGES.flatMap((p) => Object.keys(p.limits))),
                    );
                    return allCats.map((cat) => (
                      <tr key={cat} className="border-t">
                        <td className="sticky left-0 z-10 bg-background px-3 py-2 text-xs font-medium text-foreground">
                          {cat}
                        </td>
                        {PLATE_PACKAGES.map((p) => {
                          const isSel = state.platePackageId === p.id;
                          const n = (p.limits as Record<string, number>)[cat];
                          return (
                            <td
                              key={p.id}
                              className={`border-l px-3 py-2 text-center tabular-nums ${
                                isSel ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {n ?? "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className="mb-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{t("menu.includedEvery")}</span>{" "}
              {COMMON_PLATE_ITEMS.join(" · ")}
            </div>

            {!state.platePackageId ? (
              <p className="text-sm text-muted-foreground">{t("menu.selectPlate")}</p>
            ) : (
            <Accordion
              type="multiple"
              defaultValue={[]}
              className="w-full"
            >
              {Object.entries(menuByCategory).map(([cat, items]) => {
                const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
                const limit = (plate?.limits as Record<string, number> | undefined)?.[cat] ?? 0;
                const selectedItems = items.filter((m) => state.menuItemIds.includes(m.id));
                const selectedCount = selectedItems.length;
                // Cheapest selections fill the included slots; pricier ones are extras.
                const includedIds = new Set(
                  [...selectedItems].sort((a, b) => a.price - b.price).slice(0, limit).map((m) => m.id),
                );
                const extraCount = Math.max(0, selectedCount - limit);
                const catInvalid = invalidCats.has(cat);
                return (
                  <AccordionItem key={cat} value={cat} className={`border-b-0 mb-2 overflow-hidden rounded-lg border bg-white ${catInvalid ? "ring-2 ring-destructive/60" : ""}`}>
                    <AccordionTrigger className="bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:no-underline">
                      <span className="flex items-center gap-2">
                        {cat}
                        {limit > 0 ? (
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
                        {limit > 0 && extraCount > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            +{extraCount} {t("menu.extra")}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white px-4 pb-4">
                      <p className="pt-3 text-xs text-muted-foreground">
                        {limit > 0
                          ? `First ${limit} selection${limit > 1 ? "s" : ""} included in plate price. Any beyond add per-plate cost (lowest-priced fills the included slots).`
                          : "Custom plate — every selected dish is added to the per-plate cost."}
                      </p>
                      {(() => {
                        const hasSub = items.some((m) => m.subcategory);
                        const groups: Record<string, typeof items> = {};
                        items.forEach((m) => {
                          const key = m.subcategory || "";
                          (groups[key] ||= []).push(m);
                        });
                        const renderCard = (m: typeof items[number]) => {
                          const isSel = state.menuItemIds.includes(m.id);
                          const isExtra = isSel && !includedIds.has(m.id);
                          const priceLabel =
                            m.price === 0
                              ? isExtra
                                ? t("menu.includedBeyond")
                                : t("menu.included")
                              : isExtra
                                ? `+₹${m.price}/plate (extra)`
                                : `+₹${m.price}/plate`;
                          return (
                            <SelectableCard
                              key={m.id}
                              selected={isSel}
                              onClick={() => update("menuItemIds", toggle(state.menuItemIds, m.id))}
                              title={m.name}
                              price={priceLabel}
                              subtitle={isExtra ? t("menu.beyondLimit") : undefined}
                              compact
                            />
                          );
                        };
                        if (!hasSub) {
                          return (
                            <div className="grid gap-2 pt-3 sm:grid-cols-3 lg:grid-cols-4">
                              {items.map(renderCard)}
                            </div>
                          );
                        }
                        return (
                          <Accordion
                            type="multiple"
                            defaultValue={[]}
                            className="w-full pt-3"
                          >
                            {Object.entries(groups).map(([sub, subItems]) => {
                              const subSelCount = subItems.filter((m) => state.menuItemIds.includes(m.id)).length;
                              return (
                                <AccordionItem
                                  key={sub}
                                  value={sub}
                                  className="border-b-0 mb-2 overflow-hidden rounded-md border bg-white"
                                >
                                  <AccordionTrigger className="bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:no-underline">
                                    <span className="flex items-center gap-2">
                                      {sub || "Other"}
                                      {subSelCount > 0 && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                          {subSelCount} {t("menu.selected")}
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
            )}
          </SectionCard>
        </TabsContent>

        {/* DECOR */}
        {/* STAGE */}
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

        {/* SUMMARY */}
        <TabsContent value="summary" className="mt-6">
          <SectionCard title={t("summary.title")} description={t("summary.desc")}>
            <div id="print-area" className="space-y-6">
              <div className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
                <SummaryField label={t("summary.customer")} value={state.basics.customerName || "—"} />
                <SummaryField label={t("summary.phone")} value={state.basics.phone || "—"} />
                <SummaryField label={t("summary.event")} value={state.basics.eventType || "—"} />
                <SummaryField label={t("summary.date")} value={formatEventDate(state.basics.eventDate)} highlight />
                <SummaryField label={t("summary.timing")} value={formatTiming(state)} highlight />
                <SummaryField label={t("summary.guests")} value={String(state.basics.guestCount || 0)} />
                <SummaryField label={t("summary.source")} value={state.basics.source || "—"} />
              </div>

              <SelectionsBreakdown state={state} />

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
            <Button onClick={handleDownloadPdf} className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
              <Printer className="mr-1 h-4 w-4" /> {t("common.downloadPdf")}
            </Button>
          ) : (
            <Button onClick={goNext} className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
              {t("common.next")} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {idx === 0 && !state.packageId && (
        <div className="no-print flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t("common.tipPackage")}
        </div>
      )}
    </div>
  );
};

const SummaryField = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className={highlight ? "text-lg font-semibold text-primary" : "font-medium text-foreground"}>{value}</div>
  </div>
);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const formatEventDate = (iso: string): string => {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const idx = Math.max(0, Math.min(11, Number(mo) - 1));
  return `${d} ${MONTHS[idx]} ${y}`;
};

const formatTiming = (s: EnquiryState): string => {
  const pkg = PACKAGES.find((p) => p.id === s.packageId);
  const slot = pkg?.slots?.find((sl) => sl.id === s.slotId) || pkg?.slots?.[0];
  if (!slot) return "—";
  // Extract a "08:00 AM – 02:00 PM" / "08:00 AM - 02:00 PM" range from the label.
  const re = /(\d{1,2}:\d{2}\s?[APap][Mm])\s*[–-]\s*(\d{1,2}:\d{2}\s?[APap][Mm])/;
  const m = re.exec(slot.label);
  if (m) return `${m[1]} to ${m[2]}`;
  return slot.label;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium tabular-nums">{value}</span>
  </div>
);

const SelectionsBreakdown = ({ state }: { state: EnquiryState }) => {
  const { t } = useT();
  const pkg = PACKAGES.find((p) => p.id === state.packageId);
  const venue = VENUE_OPTIONS.find((v) => v.id === state.venueId);
  const plate = PLATE_PACKAGES.find((p) => p.id === state.platePackageId);
  const stage = STAGE_OPTIONS.find((s) => s.id === state.stageId);
  const chair = CHAIR_OPTIONS.find((c) => c.id === state.chairId);
  const decors = DECOR_OPTIONS.filter((d) => state.decorIds.includes(d.id));
  const extras = EXTRA_SERVICES.filter((e) => state.extraIds.includes(e.id));

  // Group selected menu items by category, in MENU_ITEMS source order
  const selectedMenu = MENU_ITEMS.filter((m) => state.menuItemIds.includes(m.id));
  const menuByCat = selectedMenu.reduce<Record<string, typeof MENU_ITEMS>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {});

  const sections: { title: string; body: React.ReactNode; key: string }[] = [];

  if (venue) {
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

  if (pkg) {
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
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {pkg.perks.map((perk) => (
                <li key={perk}>• {perk}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    });
  }

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
          </div>
          {Object.keys(menuByCat).length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("summary.noDishes")}</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(menuByCat).map(([cat, items]) => {
                const limit = (plate.limits as Record<string, number>)[cat] ?? 0;
                const sorted = [...items].sort((a, b) => a.price - b.price);
                const includedIds = new Set(sorted.slice(0, limit).map((m) => m.id));
                return (
                  <div key={cat} className="rounded-md border bg-muted/30 p-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat}
                      {limit > 0 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {Math.min(items.length, limit)}/{limit} {t("menu.included")}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-0.5">
                      {items.map((m) => {
                        const isExtra = limit > 0 && !includedIds.has(m.id);
                        const isCustom = limit === 0;
                        return (
                          <li key={m.id} className="flex items-center justify-between text-xs">
                            <span>{m.name}</span>
                            <span className={isExtra || isCustom ? "font-medium text-amber-700" : "text-muted-foreground"}>
                              {isExtra || isCustom ? `+₹${m.price}/plate` : t("menu.included")}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    });
  }

  if (decors.length > 0) {
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

  if (stage) {
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

  if (extras.length > 0) {
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

  const menuSection = sections.find((s) => s.key === "menu");
  const otherSections = sections.filter((s) => s.key !== "menu");

  const renderSection = (sec: { title: string; body: React.ReactNode; key: string }) => (
    <div key={sec.key} className="rounded-lg border bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
        {sec.title}
      </div>
      {sec.body}
    </div>
  );

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("summary.selectionDetails")}
      </h3>
      <div className="grid gap-3 md:grid-cols-2 md:items-start">
        <div className="space-y-3">
          {menuSection ? renderSection(menuSection) : null}
        </div>
        <div className="space-y-3">
          {otherSections.map(renderSection)}
        </div>
      </div>
    </div>
  );
};