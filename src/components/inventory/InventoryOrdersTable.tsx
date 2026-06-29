import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useT } from "@/i18n";
import type { InventoryOrderRecord } from "@/lib/inventoryOrdersApi";

type Props = {
  orders: InventoryOrderRecord[];
  onView?: (order: InventoryOrderRecord) => void;
};

const statusVariant = (status: InventoryOrderRecord["status"]) => {
  if (status === "DELIVERED") return "default" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
};

export const InventoryOrdersTable = ({ orders, onView }: Props) => {
  const { t } = useT();

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("orderInventory.col.order")}</TableHead>
            <TableHead>{t("orderInventory.vendor")}</TableHead>
            <TableHead>{t("orderInventory.deliveryAt")}</TableHead>
            <TableHead>{t("orderInventory.tagEvent")}</TableHead>
            <TableHead className="text-right">{t("orderInventory.col.items")}</TableHead>
            <TableHead>{t("orderInventory.col.status")}</TableHead>
            {onView ? (
              <TableHead className="text-right">{t("orderInventory.col.actions")}</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{order.vendor.vendorName}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {format(new Date(order.deliveryAt), "dd MMM yyyy, h:mm a")}
              </TableCell>
              <TableCell className="max-w-[12rem] truncate text-muted-foreground">
                {order.event
                  ? `${order.event.eventType} · ${format(new Date(`${order.event.eventDate}T00:00:00`), "dd MMM")}`
                  : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {t("orderInventory.itemCount").replace("{count}", String(order.lineItems.length))}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(order.status)}>
                  {t(`orderInventory.status.${order.status.toLowerCase()}`)}
                </Badge>
              </TableCell>
              {onView ? (
                <TableCell className="text-right">
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
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
