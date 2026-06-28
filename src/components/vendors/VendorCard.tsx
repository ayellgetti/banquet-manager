import { Pencil, Star } from "lucide-react";
import { formatEnquiryBudget, type VendorRecord } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";

type Props = {
  vendor: VendorRecord;
  onEdit?: (vendor: VendorRecord) => void;
};

export const VendorCard = ({ vendor, onEdit }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {vendor.category}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {vendor.rating.toFixed(1)}
            </span>
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                aria-label={t("vendors.edit")}
                onClick={() => onEdit(vendor)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{vendor.name}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">{vendor.email}</p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.startingAt")}
            </p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">
              {formatEnquiryBudget(vendor.startingRate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.usedInLabel")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {t("vendors.usedIn").replace("{count}", String(vendor.usedInCount))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
