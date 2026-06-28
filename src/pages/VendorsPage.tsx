import { LayoutGrid, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorsTable } from "@/components/vendors/VendorsTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { Button } from "@/components/ui/button";
import { useVendorsQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

type ViewMode = "grid" | "list";

const VendorsPage = () => {
  const { t } = useT();
  const { data: vendors, isLoading, isError } = useVendorsQuery();
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!vendors) return [];
    return vendors.filter((vendor) =>
      matchesListSearch(search, vendor.name, vendor.email, vendor.category),
    );
  }, [vendors, search]);

  const pageSize = view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table;
  const pagination = useListPagination(filtered, {
    pageSize,
    resetKey: `${search}|${view}`,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("vendors.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("vendors.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("vendors.section")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex shrink-0 rounded-lg border border-border/70 bg-muted/30 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", view === "grid" && "bg-background shadow-sm")}
              aria-label={t("vendors.viewGrid")}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", view === "list" && "bg-background shadow-sm")}
              aria-label={t("vendors.viewList")}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("vendors.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              {t("vendors.addVendor")}
            </Button>
          </div>
        </div>
      </div>

      {!vendors?.length ? (
        <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{t("vendors.empty")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : view === "grid" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagination.items.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <VendorsTable vendors={pagination.items} />
          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
