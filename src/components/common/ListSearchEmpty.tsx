import { useT } from "@/i18n";

export const ListSearchEmpty = () => {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
      <p className="text-sm text-muted-foreground">{t("common.search.noResults")}</p>
    </div>
  );
};
