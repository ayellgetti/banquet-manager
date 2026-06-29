import { format } from "date-fns";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventoryOrderDetailQuery } from "@/hooks/useBanquetData";
import { useT } from "@/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
};

const statusVariant = (status: "PLACED" | "DELIVERED" | "CANCELLED") => {
  if (status === "DELIVERED") return "default" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export const InventoryOrderViewModal = ({ open, onOpenChange, orderId }: Props) => {
  const { t } = useT();
  const activeOrderId = open && orderId ? orderId : undefined;
  const { data: order, isLoading, isError } = useInventoryOrderDetailQuery(activeOrderId);

  const eventLabel = order?.event
    ? `${order.event.eventType} · ${format(new Date(`${order.event.eventDate}T00:00:00`), "dd MMM yyyy")} · ${order.event.customer.firstName} ${order.event.customer.lastName}`
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {t("orderInventory.viewTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {order ? `${order.orderNumber} · ${order.vendor.vendorName}` : t("common.loading")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {isLoading && <DataLoadingState label={t("common.loading")} className="min-h-[12rem]" />}
          {isError && (
            <p className="text-sm text-destructive">{t("orderInventory.detailError")}</p>
          )}
          {order && (
            <>
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{order.orderNumber}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{order.vendor.vendorName}</p>
                  </div>
                  <Badge variant={statusVariant(order.status)}>
                    {t(`orderInventory.status.${order.status.toLowerCase()}`)}
                  </Badge>
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label={t("orderInventory.deliveryLabel")}
                    value={format(new Date(order.deliveryAt), "dd MMM yyyy, h:mm a")}
                  />
                  <DetailField label={t("orderInventory.tagEvent")} value={eventLabel} />
                  {order.notes ? (
                    <div className="sm:col-span-2">
                      <DetailField label={t("orderInventory.notes")} value={order.notes} />
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-xl border border-border/70 bg-card shadow-soft">
                <div className="border-b border-border/60 px-5 py-4">
                  <h3 className="text-sm font-semibold">{t("orderInventory.materials")}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("orderInventory.itemCount").replace("{count}", String(order.lineItems.length))}
                  </p>
                </div>
                {order.lineItems.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    {t("orderInventory.emptyItems")}
                  </p>
                ) : (
                  <div className="overflow-x-auto scrollbar-subtle">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("orderInventory.col.material")}</TableHead>
                          <TableHead>{t("orderInventory.col.category")}</TableHead>
                          <TableHead className="text-right">{t("orderInventory.col.qty")}</TableHead>
                          <TableHead>{t("orderInventory.col.unit")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.lineItems.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="font-medium">{line.materialName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {line.materialCategory ?? "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{line.quantity}</TableCell>
                            <TableCell>{line.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
