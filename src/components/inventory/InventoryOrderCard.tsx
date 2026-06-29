import { format } from "date-fns";
import { Eye, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";
import type { InventoryOrderRecord } from "@/lib/inventoryOrdersApi";

type Props = {
  order: InventoryOrderRecord;
  onView?: (order: InventoryOrderRecord) => void;
};

const statusVariant = (status: InventoryOrderRecord["status"]) => {
  if (status === "DELIVERED") return "default" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
};

export const InventoryOrderCard = ({ order, onView }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={statusVariant(order.status)}>
            {t(`orderInventory.status.${order.status.toLowerCase()}`)}
          </Badge>
          <div className="flex items-center gap-1">
            {onView && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("orderInventory.view")}
                onClick={() => onView(order)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              {t("orderInventory.itemCount").replace("{count}", String(order.lineItems.length))}
            </span>
          </div>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{order.orderNumber}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{order.vendor.vendorName}</p>

        {order.event ? (
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {order.event.eventType} · {format(new Date(`${order.event.eventDate}T00:00:00`), "dd MMM yyyy")}
          </p>
        ) : null}

        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("orderInventory.deliveryLabel")}
          </p>
          <p className="mt-1 text-sm font-medium">
            {format(new Date(order.deliveryAt), "dd MMM yyyy, h:mm a")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
