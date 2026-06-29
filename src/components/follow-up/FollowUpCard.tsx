import { Eye, Pencil } from "lucide-react";
import { getFollowUpUrgency, type FollowUpEnquiryRecord } from "@/data/banquetData";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  enquiry: FollowUpEnquiryRecord;
  onView?: (enquiry: FollowUpEnquiryRecord) => void;
  onEdit?: (enquiry: FollowUpEnquiryRecord) => void;
};

const urgencyClass = {
  none: "border-border bg-muted text-muted-foreground",
  scheduled: "border-border bg-secondary text-secondary-foreground",
  due: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  overdue: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const FollowUpCard = ({ enquiry, onView, onEdit }: Props) => {
  const { t } = useT();
  const urgency = getFollowUpUrgency(enquiry.nextFollowUpDate);

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          {urgency !== "none" && urgency !== "scheduled" ? (
            <Badge variant="outline" className={cn(urgencyClass[urgency])}>
              {t(`followUp.urgency.${urgency}`)}
            </Badge>
          ) : (
            <Badge variant="outline" className={cn("capitalize", urgencyClass.scheduled)}>
              {t(`enquiries.status.${enquiry.status}`)}
            </Badge>
          )}
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
              {t("followUp.col.nextFollowUp")}
            </p>
            <p className="mt-1 font-medium">
              {enquiry.nextFollowUpDate ? formatFollowUpDateTime(enquiry.nextFollowUpDate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.col.lastFollowUp")}
            </p>
            <p className="mt-1 font-medium">
              {enquiry.lastFollowUpAt ? formatFollowUpDateTime(enquiry.lastFollowUpAt) : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
