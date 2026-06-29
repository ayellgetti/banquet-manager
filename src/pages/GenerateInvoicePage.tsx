import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { Button } from "@/components/ui/button";
import { useInvoicesQuery } from "@/hooks/useBanquetData";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const GenerateInvoicePage = () => {
  const { t } = useT();
  const { data: invoices, isLoading, isError } = useInvoicesQuery();
  const [search, setSearch] = useState("");
  const [view, setView] = useListViewMode("invoices", "list");

  const filtered = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((invoice) =>
      matchesListSearch(
        search,
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.customerPhone,
        invoice.bookingNumber,
      ),
    );
  }, [invoices, search]);

  const pagination = useListPagination(filtered, {
    pageSize: view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table,
    resetKey: `${search}|${view}`,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("invoices.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("invoices.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("module.generateInvoice.section")}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {t("module.generateInvoice.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("module.generateInvoice.pageDesc")}</p>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <ViewModeToggle value={view} onChange={setView} />
          <ListSearchInput value={search} onChange={setSearch} placeholder={t("invoices.search")} />
          <Button
            asChild
            size="sm"
            className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          >
            <Link to="/bill">
              <Plus className="h-4 w-4" />
              {t("invoices.create")}
            </Link>
          </Button>
        </div>
      </div>

      {invoices && filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="space-y-4">
          {view === "grid" ? (
            <ListViewGrid>
              {pagination.items.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </ListViewGrid>
          ) : (
            <InvoicesTable invoices={pagination.items} />
          )}
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

export default GenerateInvoicePage;
