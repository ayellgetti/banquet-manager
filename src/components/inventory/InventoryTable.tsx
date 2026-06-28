import { AlertTriangle, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import {
  formatEnquiryBudget,
  formatInventoryQuantity,
  type InventoryRecord,
} from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  items: InventoryRecord[];
};

export const InventoryTable = ({ items }: Props) => {
  const { t } = useT();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("inventory.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.item")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.category")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.quantity")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.reorder")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.costUnit")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.value")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-border/50">
              <TableCell className="min-w-[12rem] py-4">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.vendorName}</p>
              </TableCell>
              <TableCell className="py-4 capitalize text-sm text-muted-foreground">
                {t(`inventory.category.${item.category}`)}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatInventoryQuantity(item.quantity, item.unit)}
                  </span>
                  {item.stockStatus === "low" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 border-amber-500/25 bg-amber-500/10 text-[10px] font-semibold text-amber-800",
                      )}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {t("inventory.status.low")}
                    </Badge>
                  )}
                  {item.stockStatus === "out" && (
                    <Badge
                      variant="outline"
                      className="border-destructive/25 bg-destructive/10 text-[10px] font-semibold text-destructive"
                    >
                      {t("inventory.status.out")}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">
                {formatInventoryQuantity(item.reorderLevel, item.unit)}
              </TableCell>
              <TableCell className="py-4 text-sm">{formatEnquiryBudget(item.costPerUnit)}</TableCell>
              <TableCell className="py-4 font-medium">{formatEnquiryBudget(item.value)}</TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={t("inventory.movement")}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={t("inventory.edit")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label={t("inventory.delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
