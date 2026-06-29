import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { InventoryOrderCard } from "@/components/inventory/InventoryOrderCard";
import { InventoryOrdersTable } from "@/components/inventory/InventoryOrdersTable";
import { InventoryOrderViewModal } from "@/components/inventory/InventoryOrderViewModal";
import { PlaceInventoryOrderModal } from "@/components/inventory/PlaceInventoryOrderModal";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { useInventoryOrdersQuery } from "@/hooks/useBanquetData";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import type { InventoryOrderRecord } from "@/lib/inventoryOrdersApi";

const InventoryPage = () => {
  const { t } = useT();
  const { data: orders, isLoading, isError } = useInventoryOrdersQuery();
  const [view, setView] = useListViewMode("inventory", "grid");
  const [search, setSearch] = useState("");
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) =>
      matchesListSearch(
        search,
        order.orderNumber,
        order.vendor.vendorName,
        order.event?.eventType,
        order.status,
        order.notes,
      ),
    );
  }, [orders, search]);

  const pageSize = view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table;
  const pagination = useListPagination(filtered, {
    pageSize,
    resetKey: `${search}|${view}`,
  });

  const handleViewOrder = (order: InventoryOrderRecord) => {
    setViewOrderId(order.id);
    setViewOpen(true);
  };

  const handleViewOpenChange = (open: boolean) => {
    setViewOpen(open);
    if (!open) setViewOrderId(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("orderInventory.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("orderInventory.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("orderInventory.section")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={view} onChange={setView} />
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("orderInventory.search")} />
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            onClick={() => setPlaceOrderOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t("orderInventory.placeOrder")}
          </Button>
          </div>
        </div>
      </div>

      {!orders?.length ? (
        <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{t("orderInventory.noOrders")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="space-y-4">
          {view === "grid" ? (
            <ListViewGrid>
              {pagination.items.map((order) => (
                <InventoryOrderCard key={order.id} order={order} onView={handleViewOrder} />
              ))}
            </ListViewGrid>
          ) : (
            <InventoryOrdersTable orders={pagination.items} onView={handleViewOrder} />
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

      <PlaceInventoryOrderModal open={placeOrderOpen} onOpenChange={setPlaceOrderOpen} />
      <InventoryOrderViewModal open={viewOpen} onOpenChange={handleViewOpenChange} orderId={viewOrderId} />
    </div>
  );
};

export default InventoryPage;
