import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FollowUpModal } from "@/components/follow-up/FollowUpModal";
import { FollowUpTable } from "@/components/follow-up/FollowUpTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFollowUpStats, type FollowUpEnquiryRecord } from "@/data/banquetData";
import { useFollowUpEnquiriesQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const FollowUpPage = () => {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: enquiries, isLoading, isError } = useFollowUpEnquiriesQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState<FollowUpEnquiryRecord | null>(null);
  const [search, setSearch] = useState("");

  const paramId = searchParams.get("enquiryId");

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
      ),
    );
  }, [enquiries, search]);

  const pagination = useListPagination(filtered, {
    pageSize: LIST_PAGE_SIZE.table,
    resetKey: search,
  });

  const stats = useMemo(
    () => (enquiries ? getFollowUpStats(enquiries) : { open: 0, dueThisWeek: 0, overdue: 0 }),
    [enquiries],
  );

  useEffect(() => {
    if (paramId && enquiries) {
      const match = enquiries.find((e) => e.id === paramId);
      if (match) {
        setActiveEnquiry(match);
        setModalOpen(true);
      }
    }
  }, [paramId, enquiries]);

  const openLogFollowUp = () => {
    setActiveEnquiry(null);
    setModalOpen(true);
    setSearchParams({}, { replace: true });
  };

  const openEnquiry = (enquiry: FollowUpEnquiryRecord) => {
    setActiveEnquiry(enquiry);
    setModalOpen(true);
    setSearchParams({ enquiryId: enquiry.id }, { replace: true });
  };

  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setActiveEnquiry(null);
      setSearchParams({}, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("followUp.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("followUp.error")}
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("followUp.section")}
          </p>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("followUp.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={openLogFollowUp}
              disabled={!enquiries?.length}
            >
              <Plus className="h-4 w-4" />
              {t("followUp.recordFollowUp")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.open")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.open}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.dueWeek")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.dueThisWeek}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.overdue")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-destructive">{stats.overdue}</p>
            </CardContent>
          </Card>
        </div>

        {enquiries &&
          (filtered.length === 0 ? (
            <ListSearchEmpty />
          ) : (
            <div className="space-y-4">
              <FollowUpTable enquiries={pagination.items} onEdit={openEnquiry} />
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

      <FollowUpModal
        open={modalOpen}
        onOpenChange={handleModalChange}
        enquiries={enquiries ?? []}
        enquiry={activeEnquiry}
      />
    </>
  );
};

export default FollowUpPage;
