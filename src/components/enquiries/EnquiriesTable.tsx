import { format, parseISO } from "date-fns";
import { ArrowRight, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatEnquiryBudget, type EnquiryRecord } from "@/data/enquiries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<EnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

type Props = {
  enquiries: EnquiryRecord[];
  onConvert?: (enquiry: EnquiryRecord) => void;
};

export const EnquiriesTable = ({ enquiries, onConvert }: Props) => {
  const { t } = useT();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.client")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.event")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.preferredDate")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.guests")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.budget")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.status")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enquiries.map((enquiry) => (
            <TableRow key={enquiry.id} className="border-border/50">
              <TableCell className="min-w-[14rem] py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{enquiry.clientName}</p>
                  <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                  {enquiry.note && <p className="text-sm italic text-muted-foreground">{enquiry.note}</p>}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-foreground">{enquiry.eventType}</TableCell>
              <TableCell className="whitespace-nowrap text-foreground">
                {format(parseISO(enquiry.preferredDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="whitespace-nowrap text-foreground">{enquiry.guests}</TableCell>
              <TableCell className="whitespace-nowrap font-medium text-foreground">
                {formatEnquiryBudget(enquiry.budget)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-semibold capitalize",
                    enquiry.status === "booked" || enquiry.bookingId
                      ? statusClass.booked
                      : statusClass[enquiry.status],
                  )}
                >
                  {enquiry.status === "booked" || enquiry.bookingId
                    ? t("enquiries.status.booked")
                    : t(`enquiries.status.${enquiry.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {enquiry.bookingId || enquiry.status === "booked" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        navigate(
                          `/bookings?id=${enquiry.bookingId}&date=${enquiry.preferredDate}&customerId=${enquiry.customerId}`,
                        )
                      }
                    >
                      {t("enquiries.viewBooking")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onConvert?.(enquiry)}
                    >
                      {t("enquiries.convert")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label={t("enquiries.edit")}
                    onClick={() => navigate(`/enquiry-v2?id=${enquiry.id}&date=${enquiry.preferredDate}&customerId=${enquiry.customerId}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
