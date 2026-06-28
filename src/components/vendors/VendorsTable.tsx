import { Pencil, Star } from "lucide-react";
import { formatEnquiryBudget, type VendorRecord } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useT } from "@/i18n";

type Props = {
  vendors: VendorRecord[];
  onEdit?: (vendor: VendorRecord) => void;
};

export const VendorsTable = ({ vendors, onEdit }: Props) => {
  const { t } = useT();

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.name")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.category")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.contact")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.rating")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.startingAt")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.usedIn")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("vendors.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id} className="border-border/50">
              <TableCell className="py-4 font-medium text-foreground">{vendor.name}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{vendor.category}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{vendor.email}</TableCell>
              <TableCell className="py-4">
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {vendor.rating.toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="py-4 font-medium">{formatEnquiryBudget(vendor.startingRate)}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">
                {t("vendors.usedIn").replace("{count}", String(vendor.usedInCount))}
              </TableCell>
              <TableCell className="py-4 text-right">
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label={t("vendors.edit")}
                    onClick={() => onEdit(vendor)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
