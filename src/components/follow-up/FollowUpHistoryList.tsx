import { format, parseISO } from "date-fns";
import { type FollowUpHistoryRecord } from "@/lib/followupsApi";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import type { EnquiryStatus } from "@/data/banquetData";

const statusClass: Record<EnquiryStatus, string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800",
  contacted: "border-border bg-muted text-muted-foreground",
  qualified: "border-border bg-secondary text-secondary-foreground",
  booked: "border-primary/25 bg-primary/10 text-primary",
};

type Props = {
  entries: FollowUpHistoryRecord[];
  detailed?: boolean;
};

function formatCommunicationType(value: string | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const FollowUpHistoryList = ({ entries, detailed = false }: Props) => {
  const { t } = useT();

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("followUp.historyEmpty")}</p>;
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative border-l-2 border-primary/20 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <time className="text-xs font-medium text-muted-foreground">
              {format(parseISO(entry.followupDate), "MMM d, yyyy · h:mm a")}
            </time>
            <Badge variant="outline" className={cn("text-[10px] capitalize", statusClass[entry.status])}>
              {t(`enquiries.status.${entry.status}`)}
            </Badge>
            {detailed && entry.communicationType && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {formatCommunicationType(entry.communicationType)}
              </Badge>
            )}
          </div>

          {detailed && entry.followedByName && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("followUp.followedBy").replace("{name}", entry.followedByName)}
            </p>
          )}

          <p className="mt-2 text-sm leading-relaxed text-foreground">{entry.comment}</p>

          {entry.nextFollowUpDate && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("followUp.nextScheduled").replace(
                "{date}",
                formatFollowUpDateTime(entry.nextFollowUpDate),
              )}
            </p>
          )}

          {detailed && (
            <p className="mt-1 text-[10px] text-muted-foreground/80">
              {t("followUp.loggedAt").replace("{date}", format(parseISO(entry.createdAt), "MMM d, yyyy · h:mm a"))}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
