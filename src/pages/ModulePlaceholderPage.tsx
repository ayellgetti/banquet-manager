import { useLocation } from "react-router-dom";
import { getAdminNavItem } from "@/config/adminNav";
import { useT } from "@/i18n";

const ModulePlaceholderPage = () => {
  const { pathname } = useLocation();
  const { t } = useT();
  const item = getAdminNavItem(pathname);
  const Icon = item.icon;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border/70 bg-card p-8 text-center shadow-soft sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-semibold">{t(item.titleKey)}</h2>
        <p className="mt-2 text-muted-foreground">{t(item.subtitleKey)}</p>
        {item.descKey && <p className="mt-4 text-sm text-muted-foreground">{t(item.descKey)}</p>}
      </div>
    </div>
  );
};

export default ModulePlaceholderPage;
