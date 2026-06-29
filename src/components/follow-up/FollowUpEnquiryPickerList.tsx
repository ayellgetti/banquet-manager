import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import {
  formatEnquiryBudget,
  getFollowUpUrgency,
  type FollowUpEnquiryRecord,
} from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { matchesListSearch } from "@/lib/listSearch";

const statusClass: Record<FollowUpEnquiryRecord["status"], string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

const urgencyClass: Record<ReturnType<typeof getFollowUpUrgency>, string> = {
  none: "text-muted-foreground",
  scheduled: "text-muted-foreground",
  due: "font-medium text-amber-700",
  overdue: "font-medium text-destructive",
};

type Props = {
  enquiries: FollowUpEnquiryRecord[];
  onSelect: (enquiry: FollowUpEnquiryRecord) => void;
};

export const FollowUpEnquiryPickerList = ({ enquiries, onSelect }: Props) => {
  const { t } = useT();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      enquiries.filter((enquiry) =>
        matchesListSearch(search, enquiry.clientName, enquiry.email, enquiry.eventType, enquiry.note),
      ),
    [enquiries, search],
  );

  if (enquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">{t("followUp.empty")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("followUp.selectHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ListSearchInput value={search} onChange={setSearch} placeholder={t("followUp.search")} className="sm:max-w-none" />
      {filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="max-h-[min(60vh,24rem)] space-y-2 overflow-y-auto pr-1 scrollbar-subtle">
          {filtered.map((enquiry) => {
            const urgency = getFollowUpUrgency(enquiry.nextFollowUpDate);

            return (
              <button
                key={enquiry.id}
                type="button"
                onClick={() => onSelect(enquiry)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{enquiry.clientName}</p>
                    <Badge variant="outline" className={cn("text-[10px] capitalize", statusClass[enquiry.status])}>
                      {t(`enquiries.status.${enquiry.status}`)}
                    </Badge>
                    {urgency === "overdue" && (
                      <Badge
                        variant="outline"
                        className="border-destructive/25 bg-destructive/10 text-[10px] font-semibold text-destructive"
                      >
                        {t("followUp.urgency.overdue")}
                      </Badge>
                    )}
                    {urgency === "due" && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/25 bg-amber-500/10 text-[10px] font-semibold text-amber-800"
                      >
                        {t("followUp.urgency.due")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {enquiry.eventType} · {format(parseISO(enquiry.preferredDate), "MMM d, yyyy")} ·{" "}
                    {formatEnquiryBudget(enquiry.budget)}
                  </p>
                  {enquiry.nextFollowUpDate && (
                    <p className={cn("text-xs", urgencyClass[urgency])}>
                      {t("followUp.nextOn").replace(
                        "{date}",
                        formatFollowUpDateTime(enquiry.nextFollowUpDate),
                      )}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
