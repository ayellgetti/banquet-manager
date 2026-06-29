import { format, parseISO } from "date-fns";
import { type BookingDisplayStatus, type BookingRecord, getBookingDisplayStatus } from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  bookings: BookingRecord[];
};

const statusClass: Record<BookingDisplayStatus, string> = {
  confirmed: "border-primary/25 bg-primary/10 text-primary",
  completed: "border-border bg-muted text-muted-foreground",
  tentative: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  cancelled: "border-destructive/25 bg-destructive/10 text-destructive",
};

export const BookingsTable = ({ bookings }: Props) => {
  const { t } = useT();

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("bookings.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.event")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.client")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.date")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.venue")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.guests")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("bookings.col.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const displayStatus = getBookingDisplayStatus(booking);
            return (
              <TableRow key={booking.id} className="border-border/50">
                <TableCell className="min-w-[12rem] py-4 font-medium">{booking.title}</TableCell>
                <TableCell className="py-4">
                  <p className="font-medium">{booking.clientName}</p>
                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap py-4 text-sm">
                  {format(parseISO(booking.date), "MMM d, yyyy")} · {booking.time}
                </TableCell>
                <TableCell className="py-4 text-sm">{booking.venue}</TableCell>
                <TableCell className="py-4 text-sm">{booking.guests}</TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className={cn("capitalize", statusClass[displayStatus])}>
                    {t(`bookings.displayStatus.${displayStatus}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
