import { format, parseISO } from "date-fns";
import type { ReactNode } from "react";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { FollowUpHistoryList } from "@/components/follow-up/FollowUpHistoryList";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEnquiryBudget, type EnquiryRecord } from "@/data/banquetData";
import { useEnquiryViewDetailQuery, useFollowUpHistoryQuery } from "@/hooks/useBanquetData";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<EnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiry: EnquiryRecord | null;
};

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export const EnquiryViewModal = ({ open, onOpenChange, enquiry }: Props) => {
  const { t } = useT();
  const enquiryId = open && enquiry ? enquiry.id : undefined;
  const { data: detail, isLoading, isError } = useEnquiryViewDetailQuery(enquiryId);
  const { data: history, isLoading: historyLoading, isError: historyError } = useFollowUpHistoryQuery(
    enquiryId,
  );

  if (!enquiry) {
    return null;
  }

  const status = detail?.status ?? enquiry.status;
  const isBooked = status === "booked" || !!detail?.bookingId || !!enquiry.bookingId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {t("enquiries.viewTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {enquiry.clientName} · {detail?.eventType ?? enquiry.eventType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {isLoading && <DataLoadingState label={t("common.loading")} className="min-h-[12rem]" />}
          {isError && (
            <p className="text-sm text-destructive">{t("enquiries.detailError")}</p>
          )}
          {detail && (
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{detail.clientName}</h2>
                  {detail.phone && <p className="mt-1 text-sm text-muted-foreground">{detail.phone}</p>}
                </div>
                <Badge
                  variant="outline"
                  className={cn("capitalize", isBooked ? statusClass.booked : statusClass[status])}
                >
                  {isBooked ? t("enquiries.status.booked") : t(`enquiries.status.${status}`)}
                </Badge>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label={t("enquiries.col.event")} value={detail.eventType} />
                <DetailField
                  label={t("enquiries.col.preferredDate")}
                  value={format(parseISO(detail.preferredDate), "MMM d, yyyy")}
                />
                <DetailField
                  label={t("enquiries.col.enquiryDate")}
                  value={format(parseISO(detail.enquiryDate), "MMM d, yyyy")}
                />
                <DetailField label={t("enquiries.col.guests")} value={detail.guests || "—"} />
                <DetailField
                  label={t("enquiries.col.budget")}
                  value={
                    detail.approxBudgetRange
                      ? `${detail.approxBudgetRange}${detail.budget > 0 ? ` (${formatEnquiryBudget(detail.budget)})` : ""}`
                      : detail.budget > 0
                        ? formatEnquiryBudget(detail.budget)
                        : "—"
                  }
                />
                <DetailField label={t("basics.source")} value={detail.source} />
                <DetailField label={t("enquiries.col.venue")} value={detail.venue} />
                <DetailField label={t("enquiryV2.timeSlot")} value={detail.timeSlot} />
                <DetailField label={t("enquiries.col.menu")} value={detail.menuPackage} />
                <DetailField
                  label={t("enquiries.col.decoration")}
                  value={
                    detail.decorationRequired
                      ? detail.decoration || t("enquiries.decorationRequired")
                      : detail.decoration
                  }
                />
                <DetailField label={t("enquiries.col.assignedTo")} value={detail.assignedTo} />
                <DetailField
                  label={t("enquiries.col.created")}
                  value={format(parseISO(detail.createdAt), "MMM d, yyyy · h:mm a")}
                />
              </dl>

              {detail.remarks && (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("enquiries.col.remarks")}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {detail.remarks}
                  </p>
                </div>
              )}

              {detail.specialRequirements && (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("enquiries.col.specialRequirements")}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {detail.specialRequirements}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="font-display text-lg font-semibold">{t("followUp.history")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("enquiries.viewDesc")}</p>

            <div className="mt-4">
              {historyLoading && <DataLoadingState label={t("common.loading")} className="min-h-[8rem]" />}
              {historyError && <p className="text-sm text-destructive">{t("followUp.historyError")}</p>}
              {!historyLoading && !historyError && history && (
                <FollowUpHistoryList entries={history} detailed />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
