import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "./SectionCard";
import { PlatePackageComparison } from "./PlatePackageComparison";
import {
  buildEnquiryPdfFilename,
} from "./EnquiryPdfSummary";
import { EnquirySummaryFooter, EnquirySummaryPanel } from "./EnquirySummaryPanel";
import {
  PACKAGES,
  VENUE_OPTIONS,
  getDefaultVenueId,
  EVENT_TYPES,
  SOURCES,
  APPROX_BUDGET_RANGES,
} from "@/data/enquiryOptions";
import { initialEnquiry, type EnquiryState } from "@/types/enquiry";
import { calcTotals, formatINR } from "@/lib/enquiryTotals";
import { buildEnquiryLeadPayload } from "@/lib/enquiryApi";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { submitEnquiryLeadDualWrite } from "@/lib/leadSubmitService";
import { getMinEventDateISO, validateEventDate } from "@/lib/eventDateValidation";
import { openEnquiryWhatsApp, WHATSAPP_NUMBER } from "@/lib/whatsappEnquiry";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n";

const V2_TABS = ["form", "summary"] as const;
type V2Tab = (typeof V2_TABS)[number];

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

const emptyV2State = (): EnquiryState => ({
  ...initialEnquiry,
  packageId: "",
  slotId: "",
  platePackageId: "",
  venueId: getDefaultVenueId(),
  selectMenuLater: true,
});

export const EnquiryFormV2 = () => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<V2Tab>("form");
  const [state, setState] = useState<EnquiryState>(emptyV2State);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const totals = calcTotals(state);

  const minEventDate = getMinEventDateISO();

  const invalidateSubmit = () => {
    setState((s) => (s.leadApiResponse ? { ...s, leadApiResponse: null } : s));
  };

  const updateBasic = <K extends keyof EnquiryState["basics"]>(key: K, value: EnquiryState["basics"][K]) => {
    invalidateSubmit();
    setState((s) => ({ ...s, basics: { ...s.basics, [key]: value } }));
  };

  const updateForm = <K extends keyof EnquiryState>(key: K, value: EnquiryState[K]) => {
    invalidateSubmit();
    setState((s) => ({ ...s, [key]: value }));
  };

  const updateSummary = <K extends keyof EnquiryState>(key: K, value: EnquiryState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const setTimeSlot = (packageId: string) => {
    invalidateSubmit();
    setState((s) => ({ ...s, packageId, slotId: packageId }));
  };

  const selectPlatePackage = (id: string) => {
    invalidateSubmit();
    setState((s) => ({
      ...s,
      platePackageId: id,
      menuItemIds: [],
    }));
  };

  const errors = {
    name: validateName(state.basics.customerName, t),
    phone: validatePhone(state.basics.phone, t),
    eventType: !state.basics.eventType.trim() ? t("validate.eventTypeRequired") : null,
    eventDate: validateEventDate(state.basics.eventDate, t),
    guests:
      !state.basics.guestCount || state.basics.guestCount < 1
        ? t("validate.guestsRequired")
        : null,
    source: !state.basics.source.trim() ? t("validate.sourceRequired") : null,
    timeSlot: !state.packageId ? t("validate.timeSlotRequired") : null,
  };

  const show = (key: keyof typeof errors) => touched && errors[key];
  const canViewSummary = !!state.leadApiResponse;

  const tryChangeTab = (next: V2Tab) => {
    if (next === "summary" && !canViewSummary) {
      toast.error(t("enquiryV2.needSubmitForSummary"));
      return;
    }
    setTab(next);
  };

  const validateForm = () => {
    setTouched(true);
    const allErrors = Object.values(errors).filter(Boolean);
    if (allErrors.length) {
      toast.error(t("toast.fixErrors"), {
        description: (
          <ul className="ml-4 list-disc space-y-0.5 text-white">
            {allErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ),
      });
      return false;
    }
    return true;
  };

  const submitLeadToSheet = async (): Promise<EnquiryState> => {
    const payload = buildEnquiryLeadPayload(state);
    payload.eventAdditionDetail = [
      "Module: Enquiry v2",
      payload.eventAdditionDetail,
      state.notes.trim() ? `Notes: ${state.notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await submitEnquiryLeadDualWrite(payload);
    if (result.sheetOk || result.crmOk) {
      await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.enquiries() });
      await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.openEnquiries() });
    }

    const submittedState = { ...state, leadApiResponse: { success: result.sheetOk || result.crmOk } };
    setState(submittedState);
    return submittedState;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitted = await submitLeadToSheet();
      if (submitted.leadApiResponse) {
        toast.success(t("enquiryV2.submitSuccess"));
        setTab("summary");
      }
    } catch {
      toast.error(t("toast.leadSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!validateForm()) return;
    if (!WHATSAPP_NUMBER) {
      toast.error(t("toast.whatsappNoNumber"));
      return;
    }

    setIsSubmitting(true);
    try {
      const needsSubmit = !state.leadApiResponse;
      const submittedState = needsSubmit ? await submitLeadToSheet() : state;

      if (needsSubmit) {
        toast.success(t("enquiryV2.submitSuccess"));
      }

      setTab("summary");
      window.setTimeout(() => {
        openEnquiryWhatsApp(submittedState);
      }, 150);
    } catch {
      toast.error(t("toast.leadSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("print-area-v2");
    if (!element) return;

    const filename = buildEnquiryPdfFilename(state, { prefix: "EnquiryV2" });
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

  const idx = V2_TABS.indexOf(tab);
  const goPrev = () => {
    if (idx > 0) tryChangeTab(V2_TABS[idx - 1]);
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => tryChangeTab(v as V2Tab)}>
        <div className="no-print -mx-1 overflow-x-auto sm:mx-0">
          <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft sm:w-full">
            {V2_TABS.map((k, i) => (
              <TabsTrigger
                key={k}
                value={k}
                disabled={k === "summary" && !canViewSummary}
                className="group shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold sm:flex-1 sm:text-sm"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                  {i + 1}
                </span>
                {k === "form" ? t("enquiryV2.tab.form") : t("tab.summary")}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="form" className="mt-6">
          <SectionCard title={t("enquiryV2.title")} description={t("enquiryV2.desc")} required>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="v2-customerName">{t("basics.customerName")}<Req /></Label>
                  <Input
                    id="v2-customerName"
                    value={state.basics.customerName}
                    onChange={(e) => updateBasic("customerName", e.target.value.slice(0, 100))}
                    aria-invalid={!!show("name")}
                    className={show("name") ? "border-destructive focus-visible:ring-destructive" : ""}
                    placeholder={t("basics.customerName.ph")}
                  />
                  {show("name") && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v2-phone">{t("basics.phone")}<Req /></Label>
                  <Input
                    id="v2-phone"
                    inputMode="tel"
                    value={state.basics.phone}
                    onChange={(e) => updateBasic("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    aria-invalid={!!show("phone")}
                    className={show("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {show("phone") && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label>{t("basics.eventType")}<Req /></Label>
                  <Select value={state.basics.eventType} onValueChange={(v) => updateBasic("eventType", v)}>
                    <SelectTrigger aria-invalid={!!show("eventType")} className={show("eventType") ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("basics.eventType.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {show("eventType") && <p className="text-xs text-destructive">{errors.eventType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v2-eventDate">{t("basics.eventDate")}<Req /></Label>
                  <Input
                    id="v2-eventDate"
                    type="date"
                    min={minEventDate}
                    value={state.basics.eventDate}
                    onChange={(e) => updateBasic("eventDate", e.target.value)}
                    aria-invalid={!!show("eventDate")}
                    className={show("eventDate") ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {show("eventDate") && <p className="text-xs text-destructive">{errors.eventDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t("enquiryV2.timeSlot")}<Req /></Label>
                  <Select value={state.packageId} onValueChange={setTimeSlot}>
                    <SelectTrigger aria-invalid={!!show("timeSlot")} className={show("timeSlot") ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("enquiryV2.timeSlot.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGES.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.slots?.[0]?.label ?? p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {show("timeSlot") && <p className="text-xs text-destructive">{errors.timeSlot}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="v2-guests">{t("basics.guests")}<Req /></Label>
                  <Input
                    id="v2-guests"
                    type="number"
                    min={1}
                    max={10000}
                    value={state.basics.guestCount}
                    onChange={(e) =>
                      updateBasic("guestCount", Math.max(0, Math.min(10000, Number(e.target.value) || 0)))
                    }
                    aria-invalid={!!show("guests")}
                    className={show("guests") ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {show("guests") && <p className="text-xs text-destructive">{errors.guests}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("venue.title")}</Label>
                  <Select value={state.venueId} onValueChange={(v) => updateForm("venueId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("enquiryV2.venue.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      {VENUE_OPTIONS.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("basics.source")}<Req /></Label>
                  <Select value={state.basics.source} onValueChange={(v) => updateBasic("source", v)}>
                    <SelectTrigger aria-invalid={!!show("source")} className={show("source") ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("basics.source.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {show("source") && <p className="text-xs text-destructive">{errors.source}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t("basics.approxBudget")}</Label>
                  <Select value={state.basics.approxBudget} onValueChange={(v) => updateBasic("approxBudget", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("basics.approxBudget.ph")} />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROX_BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("enquiryV2.platePackage")}</Label>
                <p className="text-sm text-muted-foreground">{t("menu.selectPlatePackage")}</p>
                <PlatePackageComparison
                  selectedId={state.platePackageId}
                  onSelect={selectPlatePackage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="v2-notes">{t("enquiryV2.notes")}</Label>
                <Textarea
                  id="v2-notes"
                  value={state.notes}
                  onChange={(e) => updateForm("notes", e.target.value.slice(0, 1000))}
                  placeholder={t("enquiryV2.notes.ph")}
                  rows={3}
                />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <EnquirySummaryPanel
            state={state}
            onUpdateState={updateSummary}
            printAreaId="print-area-v2"
          />
        </TabsContent>
      </Tabs>

      {tab === "summary" ? (
        <EnquirySummaryFooter
          state={state}
          onBack={goPrev}
          onDownloadPdf={() => void handleDownloadPdf()}
          onWhatsApp={() => void handleWhatsApp()}
          isPdfGenerating={isPdfGenerating}
          isWhatsAppLoading={isSubmitting}
        />
      ) : (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
          {state.platePackageId ? (
            <div className="text-sm">
              <span className="text-muted-foreground">{t("common.runningTotal")} </span>
              <span className="font-display text-lg font-bold text-gradient-gold">{formatINR(totals.total)}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={goPrev} disabled={idx === 0}>
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSubmitting ? t("enquiryV2.submitting") : t("enquiryV2.submit")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
