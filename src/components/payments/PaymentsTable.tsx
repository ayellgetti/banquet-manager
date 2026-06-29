import { format, parseISO } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import {
  formatPaymentAmount,
  type PaymentRecord,
  type PaymentStatus,
  type PaymentType,
} from "@/data/banquetData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  payments: PaymentRecord[];
  onEdit: (payment: PaymentRecord) => void;
};

const statusClass: Record<PaymentStatus, string> = {
  paid: "text-foreground",
  due: "text-foreground",
  overdue: "border-destructive/25 bg-destructive/10 font-semibold text-destructive",
};

const typeBadgeClass: Record<PaymentType, string> = {
  income: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  expense: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export const PaymentsTable = ({ payments, onEdit }: Props) => {
  const { t } = useT();

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{t("payments.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.type")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.party")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.reference")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.date")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.method")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.amount")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.status")}
            </TableHead>
            <TableHead className="h-11 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.col.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const isExpense = payment.paymentType === "expense";

            return (
            <TableRow key={payment.id} className="border-border/50">
              <TableCell className="whitespace-nowrap py-4">
                <Badge variant="outline" className={cn("capitalize", typeBadgeClass[payment.paymentType])}>
                  {t(`payments.type.${payment.paymentType}`)}
                </Badge>
              </TableCell>
              <TableCell className="min-w-[14rem] py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{payment.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {isExpense ? t("payments.party.vendor") : t("payments.party.client")}
                  </p>
                </div>
              </TableCell>
              <TableCell className="min-w-[12rem] py-4">
                <div className="flex items-start gap-1">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{payment.bookingTitle}</p>
                    {payment.note && (
                      <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">{payment.note}</p>
                    )}
                  </div>
                  {isExpense ? (
                    <ArrowDownLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/70" />
                  ) : (
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600/70" />
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-foreground">
                {format(parseISO(payment.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm capitalize text-foreground">
                {t(`payments.method.${payment.method}`)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                <span className={cn(isExpense && "text-amber-700 dark:text-amber-400")}>
                  {isExpense ? "−" : "+"}
                  {formatPaymentAmount(payment.amount)}
                </span>
              </TableCell>
              <TableCell>
                {payment.status === "overdue" ? (
                  <Badge variant="outline" className={cn("capitalize", statusClass.overdue)}>
                    {t("payments.status.overdue")}
                  </Badge>
                ) : (
                  <span className={cn("text-sm capitalize", statusClass[payment.status])}>
                    {t(`payments.status.${payment.status}`)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={t("payments.edit")}
                  onClick={() => onEdit(payment)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
