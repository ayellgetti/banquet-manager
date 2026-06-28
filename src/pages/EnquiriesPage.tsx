import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { QuickBookingModal } from "@/components/bookings/QuickBookingModal";
import { EnquiriesTable } from "@/components/enquiries/EnquiriesTable";
import { QuickEnquiryModal } from "@/components/enquiry/QuickEnquiryModal";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { Button } from "@/components/ui/button";
import { type EnquiryRecord } from "@/data/banquetData";
import { useEnquiriesQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const EnquiriesPage = () => {
  const { t } = useT();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [convertEnquiryId, setConvertEnquiryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const { data: enquiries, isLoading, isError } = useEnquiriesQuery();

  const filtered = useMemo(() => {
    if (!enquiries) return [];
    return enquiries.filter((enquiry) =>
      matchesListSearch(
        search,
        enquiry.clientName,
        enquiry.email,
        enquiry.phone,
        enquiry.eventType,
        enquiry.note,
        enquiry.status,
        enquiry.source,
      ),
    );
  }, [enquiries, search]);

  const pagination = useListPagination(filtered, {
    pageSize: LIST_PAGE_SIZE.table,
    resetKey: search,
  });

  const handleConvert = (enquiry: EnquiryRecord) => {
    setConvertEnquiryId(enquiry.id);
    setBookingOpen(true);
  };

  const handleBookingOpenChange = (open: boolean) => {
    setBookingOpen(open);
    if (!open) setConvertEnquiryId(undefined);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("enquiries.pipeline")}
          </p>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("enquiries.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={() => setEnquiryOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("enquiries.logEnquiry")}
            </Button>
          </div>
        </div>

        {isLoading && <DataLoadingState label={t("enquiries.loading")} />}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {t("enquiries.error")}
          </div>
        )}
        {enquiries &&
          (filtered.length === 0 ? (
            <ListSearchEmpty />
          ) : (
            <div className="space-y-4">
              <EnquiriesTable enquiries={pagination.items} onConvert={handleConvert} />
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

      <QuickEnquiryModal open={enquiryOpen} onOpenChange={setEnquiryOpen} />
      <QuickBookingModal
        open={bookingOpen}
        onOpenChange={handleBookingOpenChange}
        initialEnquiryId={convertEnquiryId}
      />
    </>
  );
};

export default EnquiriesPage;
