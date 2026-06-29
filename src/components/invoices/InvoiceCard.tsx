import { format, parseISO } from "date-fns";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPaymentAmount } from "@/data/banquetData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InvoiceListRecord } from "@/lib/invoicesApi";
import { useT } from "@/i18n";

type Props = {
  invoice: InvoiceListRecord;
};

export const InvoiceCard = ({ invoice }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {invoice.invoiceNumber}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{invoice.customerName}</h3>
        {invoice.customerPhone && (
          <p className="mt-1 text-sm text-muted-foreground">{invoice.customerPhone}</p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("invoice.date")}
            </p>
            <p className="mt-1 text-sm font-medium">{format(parseISO(invoice.invoiceDate), "MMM d, yyyy")}</p>
          </div>
          <p className="font-display text-xl font-bold tabular-nums">{formatPaymentAmount(invoice.totalAmount)}</p>
        </div>

        <Button asChild variant="outline" size="sm" className="mt-4 w-full gap-2">
          <Link to={`/bill?id=${invoice.id}`}>
            <FileText className="h-4 w-4" />
            {t("invoices.open")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
