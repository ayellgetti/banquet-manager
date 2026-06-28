import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatEventMeta, type CalendarEvent } from "@/data/calendarEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

const statusClass: Record<CalendarEvent["status"], string> = {
  confirmed: "border-primary/25 bg-primary/10 text-primary",
  tentative: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  enquiry: "border-sky-500/25 bg-sky-500/10 text-sky-800",
};

type Props = {
  event: CalendarEvent;
  dateParam: string;
  onNavigate?: () => void;
};

export const CalendarDayEventCard = ({ event, dateParam, onNavigate }: Props) => {
  const { t } = useT();
  const navigate = useNavigate();

  const handleEdit = () => {
    onNavigate?.();
    if (event.kind === "booking") {
      navigate(`/bookings?date=${dateParam}&id=${event.logId}&customerId=${event.customerId}`);
      return;
    }
    navigate(`/enquiry-v2?date=${dateParam}&id=${event.logId}&customerId=${event.customerId}`);
  };

  return (
    <article className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-medium leading-snug text-foreground">{event.title}</h3>
            <Badge variant="outline" className={cn("shrink-0 text-[11px] font-semibold", statusClass[event.status])}>
              {t(`calendar.status.${event.status}`)}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{formatEventMeta(event, t("calendar.guests"))}</p>
          <p className="text-sm font-medium text-foreground/90">{event.client}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          aria-label={t("calendar.modal.editEvent")}
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
};
