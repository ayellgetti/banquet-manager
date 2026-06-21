import { AppShell } from "@/components/layout/AppShell";
import { DigitalVisitingCard } from "@/components/visiting-card/DigitalVisitingCard";
import { useT } from "@/i18n";

const VisitingCardPage = () => {
  const { t } = useT();
  return (
    <AppShell title={t("module.visitingCard.title")} subtitle={t("module.visitingCard.subtitle")}>
      <DigitalVisitingCard />
    </AppShell>
  );
};

export default VisitingCardPage;
