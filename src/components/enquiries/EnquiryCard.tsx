import { format, parseISO } from "date-fns";
import { ArrowRight, Eye, Pencil } from "lucide-react";
import { formatEnquiryBudget, type EnquiryRecord } from "@/data/enquiries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<EnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

type Props = {
  enquiry: EnquiryRecord;
  onConvert?: (enquiry: EnquiryRecord) => void;
  onEdit?: (enquiry: EnquiryRecord) => void;
  onView?: (enquiry: EnquiryRecord) => void;
};

export const EnquiryCard = ({ enquiry, onConvert, onEdit, onView }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("capitalize", statusClass[enquiry.status])}>
            {t(`enquiries.status.${enquiry.status}`)}
          </Badge>
          <div className="flex gap-1">
            {onView && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(enquiry)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(enquiry)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{enquiry.clientName}</h3>
        <p className="mt-1 whitespace-normal break-words text-sm text-muted-foreground">{enquiry.eventType}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.preferredDate")}
            </p>
            <p className="mt-1 font-medium">{format(parseISO(enquiry.preferredDate), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.budget")}
            </p>
            <p className="mt-1 font-medium">{formatEnquiryBudget(enquiry.budget)}</p>
          </div>
        </div>

        {onConvert && enquiry.status !== "booked" && (
          <Button
            type="button"
            size="sm"
            className="mt-4 w-full gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            onClick={() => onConvert(enquiry)}
          >
            {t("enquiries.convert")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
