import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerCreateModal } from "@/components/customers/CustomerCreateModal";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useCustomersQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const CustomersPage = () => {
  const { t } = useT();
  const { data: customers, isLoading, isError } = useCustomersQuery();
  const [view, setView] = useListViewMode("customers", "grid");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!customers) return [];
    return customers.filter((customer) =>
      matchesListSearch(search, customer.name, customer.email, customer.phone, customer.notes),
    );
  }, [customers, search]);

  const pageSize = view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table;
  const pagination = useListPagination(filtered, {
    pageSize,
    resetKey: `${search}|${view}`,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("customers.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("customers.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("customers.section")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={view} onChange={setView} />
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("customers.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("customers.addCustomer")}
            </Button>
          </div>
        </div>
      </div>

      {!customers?.length ? (
        <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{t("customers.empty")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="space-y-4">
          {view === "grid" ? (
            <ListViewGrid>
              {pagination.items.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </ListViewGrid>
          ) : (
            <CustomersTable customers={pagination.items} />
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
      <CustomerCreateModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};

export default CustomersPage;
