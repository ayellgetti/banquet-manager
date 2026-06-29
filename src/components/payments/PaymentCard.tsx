import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { formatPaymentAmount, type PaymentRecord } from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  payment: PaymentRecord;
  onEdit?: (payment: PaymentRecord) => void;
};

const typeBadgeClass = {
  income: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  expense: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export const PaymentCard = ({ payment, onEdit }: Props) => {
  const { t } = useT();
  const isExpense = payment.paymentType === "expense";

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("capitalize", typeBadgeClass[payment.paymentType])}>
            {t(`payments.type.${payment.paymentType}`)}
          </Badge>
          {onEdit && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(payment)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{payment.clientName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{payment.bookingTitle}</p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.date")}
            </p>
            <p className="mt-1 text-sm font-medium">{format(parseISO(payment.date), "MMM d, yyyy")}</p>
          </div>
          <p className={cn("font-display text-xl font-bold tabular-nums", isExpense && "text-amber-700 dark:text-amber-400")}>
            {isExpense ? "−" : "+"}
            {formatPaymentAmount(payment.amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
