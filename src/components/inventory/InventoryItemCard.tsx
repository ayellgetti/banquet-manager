import { formatPaymentAmount, type InventoryRecord } from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  item: InventoryRecord;
};

const stockClass = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  low: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  out: "border-destructive/30 bg-destructive/10 text-destructive",
};

const stockLabel = {
  ok: "inventory.status.ok",
  low: "inventory.status.low",
  out: "inventory.status.out",
} as const;

export const InventoryItemCard = ({ item }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("capitalize", stockClass[item.stockStatus])}>
            {t(stockLabel[item.stockStatus])}
          </Badge>
          <span className="text-xs capitalize text-muted-foreground">{t(`inventory.category.${item.category}`)}</span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{item.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.vendorName}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.quantity")}
            </p>
            <p className="mt-1 font-medium">
              {item.quantity} {item.unit}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("inventory.col.value")}
            </p>
            <p className="mt-1 font-medium">{formatPaymentAmount(item.value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
