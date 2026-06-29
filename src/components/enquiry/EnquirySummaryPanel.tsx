import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "./SectionCard";
import {
  DjPdfSuggestion,
  formatEventDate,
  formatTiming,
  Row,
  SelectionsBreakdown,
  SummaryField,
} from "./EnquiryPdfSummary";
import { DJ_EXTRA_ID } from "@/data/enquiryOptions";
import type { EnquiryState } from "@/types/enquiry";
import { calcTotals, formatINR } from "@/lib/enquiryTotals";
import { useT } from "@/i18n";

type PanelProps = {
  state: EnquiryState;
  onUpdateState: <K extends keyof EnquiryState>(key: K, value: EnquiryState[K]) => void;
  printAreaId?: string;
};

export const EnquirySummaryPanel = ({
  state,
  onUpdateState,
  printAreaId = "print-area-summary",
}: PanelProps) => {
  const { t } = useT();
  const totals = calcTotals(state);

  return (
    <SectionCard title={t("summary.title")} description={t("summary.desc")}>
      <div id={printAreaId} className="space-y-6">
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

        <SelectionsBreakdown state={state} />

        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-noir p-6 text-white shadow-gold [&_.text-muted-foreground]:text-white/70 [&_.tabular-nums]:text-white">
          <span
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-gold opacity-20 blur-3xl"
          />
          <Row label={t("summary.subtotal")} value={formatINR(totals.subtotal)} />
          <div className="mt-1 flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("summary.discount").replace(" (%)", "")}</span>
              <div className="inline-flex overflow-hidden rounded-md border border-white/20 no-print">
                <button
                  type="button"
                  onClick={() => onUpdateState("discountType", "percent")}
                  className={`h-7 px-2 text-xs font-semibold transition-colors ${state.discountType === "percent" ? "bg-gradient-gold text-primary-foreground" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateState("discountType", "fixed")}
                  className={`h-7 px-2 text-xs font-semibold transition-colors ${state.discountType === "fixed" ? "bg-gradient-gold text-primary-foreground" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
                >
                  ₹
                </button>
              </div>
              {state.discountType === "percent" ? (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={state.discountPercent}
                  onChange={(e) =>
                    onUpdateState("discountPercent", Math.max(0, Math.min(100, Number(e.target.value) || 0)))
                  }
                  className="h-7 w-20 border-white/20 bg-white/10 text-right text-white placeholder:text-white/40 focus-visible:ring-primary/50 no-print"
                />
              ) : (
                <Input
                  type="number"
                  min={0}
                  value={state.discountAmount}
                  onChange={(e) => onUpdateState("discountAmount", Math.max(0, Number(e.target.value) || 0))}
                  className="h-7 w-24 border-white/20 bg-white/10 text-right text-white placeholder:text-white/40 focus-visible:ring-primary/50 no-print"
                />
              )}
            </div>
            <span className="text-sm font-medium tabular-nums text-white/90">- {formatINR(totals.discount)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="font-display text-base font-semibold uppercase tracking-wider text-white/80">
              {t("summary.grandTotal")}
            </span>
            <span className="font-display text-3xl font-bold text-gradient-gold tabular-nums">
              {formatINR(totals.total)}
            </span>
          </div>
        </div>

        {state.notes.trim() && (
          <div className="space-y-2">
            <Label>{t("summary.notes")}</Label>
            <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">{state.notes.trim()}</p>
          </div>
        )}

        {!state.extraIds.includes(DJ_EXTRA_ID) && <DjPdfSuggestion />}
      </div>
    </SectionCard>
  );
};

type FooterProps = {
  state: EnquiryState;
  onBack: () => void;
  onDownloadPdf: () => void;
  onWhatsApp?: () => void;
  isPdfGenerating?: boolean;
  isWhatsAppLoading?: boolean;
  showWhatsApp?: boolean;
};

export const EnquirySummaryFooter = ({
  state,
  onBack,
  onDownloadPdf,
  onWhatsApp,
  isPdfGenerating = false,
  isWhatsAppLoading = false,
  showWhatsApp = true,
}: FooterProps) => {
  const { t } = useT();
  const totals = calcTotals(state);

  return (
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
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}
        </Button>
        {showWhatsApp && onWhatsApp ? (
          <Button
            variant="outline"
            onClick={onWhatsApp}
            disabled={isWhatsAppLoading}
            className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
          >
            {isWhatsAppLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <WhatsAppIcon className="mr-1 h-4 w-4" />
            )}
            {isWhatsAppLoading ? t("enquiryV2.submitting") : t("whatsapp.send")}
          </Button>
        ) : null}
        <Button
          onClick={onDownloadPdf}
          disabled={isPdfGenerating}
          className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
        >
          <Printer className="mr-1 h-4 w-4" />
          {isPdfGenerating ? t("toast.pdfGenerating") : t("common.downloadPdf")}
        </Button>
      </div>
    </div>
  );
};
