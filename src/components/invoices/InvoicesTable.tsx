import { format, parseISO } from "date-fns";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPaymentAmount } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InvoiceListRecord } from "@/lib/invoicesApi";
import { useT } from "@/i18n";

type Props = {
  invoices: InvoiceListRecord[];
};

export const InvoicesTable = ({ invoices }: Props) => {
  const { t } = useT();

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoice.number")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoice.customerName")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoice.date")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoices.col.booking")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoice.col.amount")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="border-border/50">
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerPhone && (
                  <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {format(parseISO(invoice.invoiceDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-sm">{invoice.bookingNumber ?? "—"}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatPaymentAmount(invoice.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link to={`/bill?id=${invoice.id}`}>
                    <FileText className="h-4 w-4" />
                    {t("invoices.open")}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
