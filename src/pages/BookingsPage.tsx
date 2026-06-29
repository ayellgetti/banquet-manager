import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookingsList } from "@/components/bookings/BookingsList";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { QuickBookingModal } from "@/components/bookings/QuickBookingModal";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { useBookingsQuery } from "@/hooks/useBanquetData";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const BookingsPage = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: bookings, isLoading, isError } = useBookingsQuery();
  const [search, setSearch] = useState("");
  const [view, setView] = useListViewMode("bookings", "grid");

  const fromEnquiry = searchParams.get("fromEnquiry");
  const prefillDate = searchParams.get("date");
  const customerId = searchParams.get("customerId");
  const focusBooking = searchParams.get("focusBooking");

  const [bookingOpen, setBookingOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((booking) =>
      matchesListSearch(
        search,
        booking.title,
        booking.clientName,
        booking.email,
        booking.phone,
        booking.eventType,
        booking.venue,
        booking.status,
        booking.menuPackage,
      ),
    );
  }, [bookings, search]);

  const pagination = useListPagination(filtered, {
    pageSize: view === "grid" ? LIST_PAGE_SIZE.booking : LIST_PAGE_SIZE.table,
    resetKey: `${search}|${view}`,
  });

  useEffect(() => {
    if (fromEnquiry) setBookingOpen(true);
  }, [fromEnquiry]);

  const handleBookingOpenChange = (open: boolean) => {
    setBookingOpen(open);
    if (!open && fromEnquiry) {
      navigate("/bookings", { replace: true });
    }
  };

  const subtitle =
    fromEnquiry && prefillDate
      ? t("bookings.convertHint")
      : prefillDate
        ? t("bookings.newForDate").replace("{date}", prefillDate)
        : null;

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            {customerId && (
              <p className="text-xs text-muted-foreground">
                {t("bookings.customerRef")}: {customerId}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ViewModeToggle value={view} onChange={setView} />
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("bookings.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={() => setBookingOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("bookings.newBooking")}
            </Button>
          </div>
        </div>

        {isLoading && <DataLoadingState label={t("bookings.loading")} />}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {t("bookings.error")}
          </div>
        )}
        {bookings &&
          (filtered.length === 0 ? (
            <ListSearchEmpty />
          ) : (
            <div className="space-y-4">
              {view === "grid" ? (
                <BookingsList bookings={pagination.items} initialExpandedId={focusBooking} />
              ) : (
                <BookingsTable bookings={pagination.items} />
              )}
              <ListPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
              />
            </div>
          ))}
      </div>

      <QuickBookingModal
        open={bookingOpen}
        onOpenChange={handleBookingOpenChange}
        defaultDate={prefillDate ?? undefined}
        initialEnquiryId={fromEnquiry ?? undefined}
      />
    </>
  );
};

export default BookingsPage;
