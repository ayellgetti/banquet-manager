import { Pencil } from "lucide-react";
import { type CustomerListRecord } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";

type Props = {
  customer: CustomerListRecord;
  onEdit?: (customer: CustomerListRecord) => void;
};

export const CustomerCard = ({ customer, onEdit }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{customer.name}</h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{customer.email}</p>
          </div>
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground"
              aria-label={t("customers.edit")}
              onClick={() => onEdit(customer)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.phone")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{customer.phone || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.bookingsLabel")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {t("customers.bookingsCount").replace("{count}", String(customer.bookingCount))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
