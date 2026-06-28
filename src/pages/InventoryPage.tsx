import { ArrowUpDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AdvanceInventoryView } from "@/components/inventory/AdvanceInventoryView";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatPaymentAmount,
  getInventoryStats,
  groupInventoryByVendor,
  type InventoryCategory,
} from "@/data/banquetData";
import { useInventoryQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

type ViewMode = "advance" | "stock";
type CategoryFilter = "all" | InventoryCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ["all", "rice", "dal", "kirana", "masala", "other"];

const InventoryPage = () => {
  const { t } = useT();
  const { data: inventory, isLoading, isError } = useInventoryQuery();
  const [view, setView] = useState<ViewMode>("advance");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(
    () => (inventory ? getInventoryStats(inventory) : { totalValue: 0, lowStock: 0, outOfStock: 0 }),
    [inventory],
  );

  const filtered = useMemo(() => {
    if (!inventory) return [];
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.vendorName.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [inventory, category, search]);

  const vendorGroups = useMemo(() => groupInventoryByVendor(filtered), [filtered]);

  const stockPagination = useListPagination(filtered, {
    pageSize: LIST_PAGE_SIZE.table,
    resetKey: `${search}|${category}|stock`,
  });

  const advancePagination = useListPagination(vendorGroups, {
    pageSize: LIST_PAGE_SIZE.card,
    resetKey: `${search}|${category}|advance`,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("inventory.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("inventory.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("inventory.section")}
        </p>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <ListSearchInput value={search} onChange={setSearch} placeholder={t("inventory.search")} />
          <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0">
            <ArrowUpDown className="h-4 w-4" />
            {t("inventory.movement")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2 shrink-0 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            {t("inventory.newItem")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.stat.value")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">
              {formatPaymentAmount(stats.totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.stat.lowStock")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.stat.outOfStock")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-destructive">
              {stats.outOfStock}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex shrink-0 rounded-lg border border-border/70 bg-muted/30 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3", view === "advance" && "bg-background shadow-sm")}
            onClick={() => setView("advance")}
          >
            {t("inventory.view.advance")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3", view === "stock" && "bg-background shadow-sm")}
            onClick={() => setView("stock")}
          >
            {t("inventory.view.stock")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((filter) => (
          <Button
            key={filter}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full capitalize",
              category === filter && "border-primary/30 bg-primary/10 text-primary",
            )}
            onClick={() => setCategory(filter)}
          >
            {filter === "all" ? t("inventory.category.all") : t(`inventory.category.${filter}`)}
          </Button>
        ))}
      </div>

      {view === "advance" ? (
        vendorGroups.length === 0 ? (
          <ListSearchEmpty />
        ) : (
          <div className="space-y-4">
            <AdvanceInventoryView groups={advancePagination.items} />
            <ListPagination
              page={advancePagination.page}
              totalPages={advancePagination.totalPages}
              totalItems={advancePagination.totalItems}
              pageSize={advancePagination.pageSize}
              onPageChange={advancePagination.setPage}
            />
          </div>
        )
      ) : filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="space-y-4">
          <InventoryTable items={stockPagination.items} />
          <ListPagination
            page={stockPagination.page}
            totalPages={stockPagination.totalPages}
            totalItems={stockPagination.totalItems}
            pageSize={stockPagination.pageSize}
            onPageChange={stockPagination.setPage}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
