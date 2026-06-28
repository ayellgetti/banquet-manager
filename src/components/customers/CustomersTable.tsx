import { Pencil } from "lucide-react";
import { type CustomerListRecord } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useT } from "@/i18n";

type Props = {
  customers: CustomerListRecord[];
  onEdit?: (customer: CustomerListRecord) => void;
};

export const CustomersTable = ({ customers, onEdit }: Props) => {
  const { t } = useT();

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.name")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.email")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.phone")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.enquiries")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="border-border/50">
              <TableCell className="py-4 font-medium text-foreground">{customer.name}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{customer.email}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{customer.phone}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">
                {customer.enquiryCount} / {customer.bookingCount}
              </TableCell>
              <TableCell className="py-4 text-right">
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label={t("customers.edit")}
                    onClick={() => onEdit(customer)}
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
