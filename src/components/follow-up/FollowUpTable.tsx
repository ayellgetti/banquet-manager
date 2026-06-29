import { format, parseISO } from "date-fns";
import { ArrowUpRight, Eye, Pencil } from "lucide-react";
import {
  formatEnquiryBudget,
  getFollowUpUrgency,
  type FollowUpEnquiryRecord,
} from "@/data/banquetData";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<FollowUpEnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

const urgencyClass: Record<ReturnType<typeof getFollowUpUrgency>, string> = {
  none: "text-muted-foreground",
  scheduled: "text-foreground",
  due: "font-medium text-amber-700",
  overdue: "font-medium text-destructive",
};

type Props = {
  enquiries: FollowUpEnquiryRecord[];
  onView: (enquiry: FollowUpEnquiryRecord) => void;
  onEdit: (enquiry: FollowUpEnquiryRecord) => void;
};

export const FollowUpTable = ({ enquiries, onView, onEdit }: Props) => {
  const { t } = useT();

  if (enquiries.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("followUp.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.client")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.enquiry")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.lastFollowUp")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.nextFollowUp")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.status")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enquiries.map((enquiry) => {
            const urgency = getFollowUpUrgency(enquiry.nextFollowUpDate);

            return (
              <TableRow key={enquiry.id} className="border-border/50">
                <TableCell className="min-w-[14rem] py-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{enquiry.clientName}</p>
                    <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                  </div>
                </TableCell>
                <TableCell className="min-w-[12rem] max-w-[16rem] py-4 align-top">
                  <div className="flex items-start gap-1">
                    <div className="min-w-0">
                      <p className="whitespace-normal break-words font-medium leading-snug text-foreground">
                        {enquiry.eventType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(enquiry.preferredDate), "MMM d, yyyy")} ·{" "}
                        {formatEnquiryBudget(enquiry.budget)}
                      </p>
                      {enquiry.note && (
                        <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">{enquiry.note}</p>
                      )}
                    </div>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  </div>
                </TableCell>
                <TableCell className="min-w-[9rem] text-sm text-foreground">
                  {enquiry.lastFollowUpAt ? formatFollowUpDateTime(enquiry.lastFollowUpAt) : "—"}
                </TableCell>
                <TableCell className="min-w-[9rem]">
                  {enquiry.nextFollowUpDate ? (
                    <span className={cn("text-sm", urgencyClass[urgency])}>
                      {formatFollowUpDateTime(enquiry.nextFollowUpDate)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("font-semibold capitalize", statusClass[enquiry.status])}>
                      {t(`enquiries.status.${enquiry.status}`)}
                    </Badge>
                    {urgency === "overdue" && (
                      <Badge
                        variant="outline"
                        className="border-destructive/25 bg-destructive/10 font-semibold text-destructive"
                      >
                        {t("followUp.urgency.overdue")}
                      </Badge>
                    )}
                    {urgency === "due" && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/25 bg-amber-500/10 font-semibold text-amber-800"
                      >
                        {t("followUp.urgency.due")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      aria-label={t("followUp.view")}
                      onClick={() => onView(enquiry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      aria-label={t("followUp.edit")}
                      onClick={() => onEdit(enquiry)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
