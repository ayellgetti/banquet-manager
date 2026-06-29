import { format, parseISO } from "date-fns";
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
import {
  formatEnquiryBudget,
  getFollowUpUrgency,
  type FollowUpEnquiryRecord,
} from "@/data/banquetData";
import { useFollowUpHistoryQuery } from "@/hooks/useBanquetData";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<FollowUpEnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiry: FollowUpEnquiryRecord | null;
};

export const FollowUpViewModal = ({ open, onOpenChange, enquiry }: Props) => {
  const { t } = useT();
  const { data: history, isLoading, isError } = useFollowUpHistoryQuery(
    open && enquiry ? enquiry.id : undefined,
  );

  if (!enquiry) {
    return null;
  }

  const urgency = getFollowUpUrgency(enquiry.nextFollowUpDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {t("followUp.viewTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {enquiry.clientName} · {enquiry.eventType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{enquiry.clientName}</h2>
                {enquiry.phone && <p className="mt-1 text-sm text-muted-foreground">{enquiry.phone}</p>}
                {enquiry.email && <p className="text-sm text-muted-foreground">{enquiry.email}</p>}
              </div>
              <Badge variant="outline" className={cn("capitalize", statusClass[enquiry.status])}>
                {t(`enquiries.status.${enquiry.status}`)}
              </Badge>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("enquiries.col.event")}
                </dt>
                <dd className="mt-1 text-sm font-medium">{enquiry.eventType}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("enquiries.col.preferredDate")}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {format(parseISO(enquiry.preferredDate), "MMM d, yyyy")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("enquiries.col.guests")}
                </dt>
                <dd className="mt-1 text-sm font-medium">{enquiry.guests}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("enquiries.col.budget")}
                </dt>
                <dd className="mt-1 text-sm font-medium">{formatEnquiryBudget(enquiry.budget)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("followUp.col.lastFollowUp")}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {enquiry.lastFollowUpAt
                    ? formatFollowUpDateTime(enquiry.lastFollowUpAt)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("followUp.col.nextFollowUp")}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {enquiry.nextFollowUpDate
                    ? formatFollowUpDateTime(enquiry.nextFollowUpDate)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("followUp.logCountLabel")}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {t("followUp.logCount").replace("{count}", String(enquiry.followUpCount))}
                </dd>
              </div>
            </div>

            {urgency === "overdue" && enquiry.nextFollowUpDate && (
              <p className="mt-3 text-sm font-medium text-destructive">
                {t("followUp.overdue").replace(
                  "{date}",
                  formatFollowUpDateTime(enquiry.nextFollowUpDate),
                )}
              </p>
            )}

            {enquiry.note && (
              <p className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
                {enquiry.note}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold">{t("followUp.history")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("followUp.viewDesc")}</p>

            <div className="mt-4">
              {isLoading && <DataLoadingState label={t("common.loading")} className="min-h-[8rem]" />}
              {isError && (
                <p className="text-sm text-destructive">{t("followUp.historyError")}</p>
              )}
              {!isLoading && !isError && history && (
                <FollowUpHistoryList entries={history} detailed />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
