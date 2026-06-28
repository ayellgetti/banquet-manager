import { Store } from "lucide-react";
import {
  formatInventoryQuantity,
  type VendorInventoryGroup,
} from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  groups: VendorInventoryGroup[];
};

export const AdvanceInventoryView = ({ groups }: Props) => {
  const { t } = useT();

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("inventory.advance.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.vendorName} className="rounded-xl border-border/70 shadow-soft">
          <CardHeader className="space-y-2 border-b border-border/60 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <CardTitle className="font-display text-base font-semibold leading-snug">
                  {group.vendorName}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("inventory.advance.itemCount").replace("{count}", String(group.items.length))}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                >
                  <span className="min-w-0 text-sm font-medium text-foreground">{item.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatInventoryQuantity(item.quantity, item.unit)}
                    </span>
                    {item.stockStatus === "low" && (
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-semibold", "border-amber-500/25 bg-amber-500/10 text-amber-800")}
                      >
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
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
