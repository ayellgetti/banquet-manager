import { useMemo, useState } from "react";
import { BookingCard } from "@/components/bookings/BookingCard";
import { getBookingDisplayStatus, type BookingRecord } from "@/data/banquetData";
import { useT } from "@/i18n";

type Props = {
  bookings: BookingRecord[];
  onEdit?: (booking: BookingRecord) => void;
};

export const BookingsList = ({ bookings, onEdit }: Props) => {
  const { t } = useT();

  const sorted = useMemo(
    () => [...bookings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [bookings],
  );

  const defaultExpandedId = useMemo(() => {
    const upcoming = sorted.find((b) => getBookingDisplayStatus(b) === "confirmed");
    return upcoming?.id ?? sorted[0]?.id ?? null;
  }, [sorted]);

  const [expandedId, setExpandedId] = useState<string | null>(defaultExpandedId);

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("bookings.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          expanded={expandedId === booking.id}
          onExpandedChange={(open) => setExpandedId(open ? booking.id : null)}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
