import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { QuickBookingModal } from "@/components/bookings/QuickBookingModal";
import { EnquiryCard } from "@/components/enquiries/EnquiryCard";
import { EnquiriesTable } from "@/components/enquiries/EnquiriesTable";
import { EnquiryViewModal } from "@/components/enquiries/EnquiryViewModal";
import { QuickEnquiryModal } from "@/components/enquiry/QuickEnquiryModal";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { type EnquiryRecord } from "@/data/banquetData";
import { useEnquiriesQuery } from "@/hooks/useBanquetData";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const EnquiriesPage = () => {
  const { t } = useT();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<EnquiryRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewEnquiry, setViewEnquiry] = useState<EnquiryRecord | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [convertEnquiryId, setConvertEnquiryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [view, setView] = useListViewMode("enquiries", "list");
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
    pageSize: view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table,
    resetKey: `${search}|${view}`,
  });

  const handleConvert = (enquiry: EnquiryRecord) => {
    setConvertEnquiryId(enquiry.id);
    setBookingOpen(true);
  };

  const handleBookingOpenChange = (open: boolean) => {
    setBookingOpen(open);
    if (!open) setConvertEnquiryId(undefined);
  };

  const handleEnquiryOpenChange = (open: boolean) => {
    setEnquiryOpen(open);
    if (!open) setEditingEnquiry(null);
  };

  const handleLogEnquiry = () => {
    setEditingEnquiry(null);
    setEnquiryOpen(true);
  };

  const handleEditEnquiry = (enquiry: EnquiryRecord) => {
    setEditingEnquiry(enquiry);
    setEnquiryOpen(true);
  };

  const handleViewEnquiry = (enquiry: EnquiryRecord) => {
    setViewEnquiry(enquiry);
    setViewOpen(true);
  };

  const handleViewOpenChange = (open: boolean) => {
    setViewOpen(open);
    if (!open) setViewEnquiry(null);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("enquiries.pipeline")}
          </p>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ViewModeToggle value={view} onChange={setView} />
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("enquiries.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={handleLogEnquiry}
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
              {view === "grid" ? (
                <ListViewGrid>
                  {pagination.items.map((enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                      onConvert={handleConvert}
                      onEdit={handleEditEnquiry}
                      onView={handleViewEnquiry}
                    />
                  ))}
                </ListViewGrid>
              ) : (
                <EnquiriesTable
                  enquiries={pagination.items}
                  onConvert={handleConvert}
                  onEdit={handleEditEnquiry}
                  onView={handleViewEnquiry}
                />
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

      <QuickEnquiryModal
        open={enquiryOpen}
        onOpenChange={handleEnquiryOpenChange}
        enquiry={editingEnquiry}
      />
      <EnquiryViewModal open={viewOpen} onOpenChange={handleViewOpenChange} enquiry={viewEnquiry} />
      <QuickBookingModal
        open={bookingOpen}
        onOpenChange={handleBookingOpenChange}
        initialEnquiryId={convertEnquiryId}
      />
    </>
  );
};

export default EnquiriesPage;
