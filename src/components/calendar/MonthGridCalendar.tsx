import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CALENDAR_EVENTS, getEventsForDate, type CalendarEvent } from "@/data/calendarEvents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onNewBooking?: () => void;
  events?: CalendarEvent[];
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export const MonthGridCalendar = ({ month, onMonthChange, onDayClick, onNewBooking, events = CALENDAR_EVENTS }: Props) => {
  const { t } = useT();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onMonthChange(addMonths(month, -1))}
            aria-label={t("calendar.prevMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[9rem] text-center font-display text-lg font-semibold sm:text-xl">
            {format(month, "MMMM yyyy")}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label={t("calendar.nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onMonthChange(new Date())}>
            {t("calendar.today")}
          </Button>
          {onNewBooking && (
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={onNewBooking}
            >
              <Plus className="h-4 w-4" />
              {t("calendar.newBooking")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-1 py-2.5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground sm:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day, events);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "group min-h-[5.5rem] border-b border-r border-border/50 p-1.5 text-left transition-colors sm:min-h-[6.5rem] sm:p-2",
                "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                !inMonth && "bg-muted/20",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  today && "bg-primary text-primary-foreground shadow-sm",
                  !today && inMonth && "text-foreground",
                  !today && !inMonth && "text-muted-foreground/60",
                )}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]",
                      event.status === "confirmed" && "bg-primary/15 text-primary",
                      event.status === "tentative" && "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                      event.status === "enquiry" && "bg-sky-500/15 text-sky-800 dark:text-sky-200",
                    )}
                  >
                    {event.time} — {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="px-1 text-[10px] font-medium text-muted-foreground">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const useCalendarDayModal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const openDay = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const openToday = () => {
    openDay(new Date());
  };

  return { selectedDate, modalOpen, setModalOpen, openDay, openToday };
};

export function formatEventDateLine(dateStr: string, time: string) {
  const date = parseISO(`${dateStr}T${time}:00`);
  return `${format(date, "EEE, MMM d")} · ${time}`;
}

export function isEventOnDay(event: CalendarEvent, day: Date) {
  return format(day, "yyyy-MM-dd") === event.date;
}
