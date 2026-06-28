import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaymentAmount, getPaymentStats } from "@/data/banquetData";
import { usePaymentsQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

const PaymentsPage = () => {
  const { t } = useT();
  const { data: payments, isLoading, isError } = usePaymentsQuery();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!payments) return [];
    return payments.filter((payment) =>
      matchesListSearch(
        search,
        payment.clientName,
        payment.email,
        payment.bookingTitle,
        payment.method,
        payment.status,
        payment.note,
      ),
    );
  }, [payments, search]);

  const pagination = useListPagination(filtered, {
    pageSize: LIST_PAGE_SIZE.table,
    resetKey: search,
  });

  const stats = useMemo(
    () => (payments ? getPaymentStats(payments) : { collected: 0, outstanding: 0, overdue: 0 }),
    [payments],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("payments.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("payments.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("payments.section")}
        </p>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <ListSearchInput value={search} onChange={setSearch} placeholder={t("payments.search")} />
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            {t("payments.recordPayment")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.stat.collected")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">
              {formatPaymentAmount(stats.collected)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.stat.outstanding")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">
              {formatPaymentAmount(stats.outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70 shadow-soft">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("payments.stat.overdue")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight text-destructive">
              {formatPaymentAmount(stats.overdue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {payments &&
        (filtered.length === 0 ? (
          <ListSearchEmpty />
        ) : (
          <div className="space-y-4">
            <PaymentsTable payments={pagination.items} onEdit={() => {}} />
            <ListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={pagination.setPage}
            />
          </div>
        ))}
    </div>
  );
};

export default PaymentsPage;
