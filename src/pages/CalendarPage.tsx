import { useEffect, useMemo, useState } from "react";
import { CalendarDayModal } from "@/components/calendar/CalendarDayModal";
import {
  formatEventDateLine,
  MonthGridCalendar,
  useCalendarDayModal,
} from "@/components/calendar/MonthGridCalendar";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDashboardStatsFromEvents,
  getInitialCalendarMonth,
  getUpcomingEvents,
} from "@/data/banquetData";
import { useCalendarEventsQuery } from "@/hooks/useBanquetData";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { parseISO } from "date-fns";

const statusClass: Record<string, string> = {
  confirmed: "border-primary/20 bg-primary/10 text-primary",
  tentative: "border-amber-500/20 bg-amber-500/10 text-amber-800",
  enquiry: "border-sky-500/20 bg-sky-500/10 text-sky-800",
};

const CalendarPage = () => {
  const { t } = useT();
  const [month, setMonth] = useState(new Date());
  const [monthInitialized, setMonthInitialized] = useState(false);
  const [upcomingSearch, setUpcomingSearch] = useState("");
  const { selectedDate, modalOpen, setModalOpen, openDay, openToday } = useCalendarDayModal();
  const { data: events, isLoading, isError } = useCalendarEventsQuery();

  useEffect(() => {
    if (events && !monthInitialized) {
      setMonth(getInitialCalendarMonth(events));
      setMonthInitialized(true);
    }
  }, [events, monthInitialized]);

  const upcoming = useMemo(() => (events ? getUpcomingEvents(events) : []), [events]);
  const filteredUpcoming = useMemo(
    () =>
      upcoming.filter((event) =>
        matchesListSearch(
          upcomingSearch,
          event.title,
          event.client,
          event.venue,
          event.category,
          event.status,
        ),
      ),
    [upcoming, upcomingSearch],
  );
  const stats = useMemo(() => getDashboardStatsFromEvents(events ?? []), [events]);

  const handleNewBooking = () => {
    setMonth(new Date());
    openToday();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("calendar.loading")} className="min-h-[28rem]" />
      </div>
    );
  }

  if (isError || !events) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("calendar.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("calendar.stat.newLeads")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.newLeads}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("calendar.stat.openFollowUps")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.openFollowUps}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("calendar.stat.currentMonthBookings")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.currentMonthBookings}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("calendar.stat.leadVsConversion")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">
              {stats.monthConversions} / {stats.monthLeads}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("calendar.stat.conversionRate").replace("{rate}", String(stats.conversionRate))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <MonthGridCalendar
          month={month}
          onMonthChange={setMonth}
          onDayClick={openDay}
          onNewBooking={handleNewBooking}
          events={events}
        />

        <aside className="flex max-h-[min(22rem,50vh)] flex-col rounded-xl border border-border/70 bg-card shadow-soft xl:max-h-[min(28rem,62vh)]">
          <div className="shrink-0 space-y-3 border-b border-border/60 px-4 py-3">
            <h3 className="font-display text-sm font-semibold">{t("calendar.upcoming.title")}</h3>
            <ListSearchInput
              value={upcomingSearch}
              onChange={setUpcomingSearch}
              placeholder={t("calendar.search")}
              className="sm:max-w-none"
            />
          </div>
          <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {upcoming.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">{t("calendar.upcoming.empty")}</p>
            ) : filteredUpcoming.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">{t("common.search.noResults")}</p>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredUpcoming.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => openDay(parseISO(event.date))}
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(`calendar.category.${event.category}`)}
                      </span>
                      <Badge variant="outline" className={cn("shrink-0 px-1.5 py-0 text-[9px]", statusClass[event.status])}>
                        {t(`calendar.status.${event.status}`)}
                      </Badge>
                    </div>
                    <p className="line-clamp-1 text-sm font-medium leading-snug text-foreground">{event.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatEventDateLine(event.date, event.time)}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {event.client}
                      {event.guests ? ` · ${event.guests} ${t("calendar.guests")}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <CalendarDayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDate}
        events={events}
      />
    </div>
  );
};

export default CalendarPage;
