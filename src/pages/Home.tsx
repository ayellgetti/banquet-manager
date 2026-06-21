import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import { useT } from "@/i18n";

const Home = () => {
  const { t } = useT();
  const modules = ADMIN_NAV_ITEMS.filter((item) => item.id !== "dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{t("admin.dashboard.welcome")}</h2>
        <p className="mt-2 text-muted-foreground">{t("admin.dashboard.desc")}</p>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("admin.dashboard.modules")}
        </h3>
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
          {modules.map(({ id, path, icon: Icon, titleKey, descKey }) => (
            <Link
              key={id}
              to={path}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground shadow-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{t(titleKey)}</p>
                {descKey && <p className="mt-0.5 truncate text-sm text-muted-foreground">{t(descKey)}</p>}
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
