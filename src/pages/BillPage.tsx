import { AppShell } from "@/components/layout/AppShell";
import { BanquetInvoiceForm } from "@/components/bill/BanquetInvoiceForm";
import { useT } from "@/i18n";

const BillPage = () => {
  const { t } = useT();
  return (
    <AppShell title={t("module.bill.title")} subtitle={t("module.bill.subtitle")}>
      <BanquetInvoiceForm />
    </AppShell>
  );
};

export default BillPage;
