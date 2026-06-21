import { Link } from "react-router-dom";
import { ClipboardList, ClipboardPen, Receipt, ShoppingBasket, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useT } from "@/i18n";

const MODULES = [
  {
    id: "enquiry",
    path: "/enquiry",
    icon: ClipboardList,
    titleKey: "module.enquiry.title",
    descKey: "module.enquiry.desc",
  },
  {
    id: "enquiry-v2",
    path: "/enquiry-v2",
    icon: ClipboardPen,
    titleKey: "module.enquiryV2.title",
    descKey: "module.enquiryV2.desc",
  },
  {
    id: "menu",
    path: "/menu-selection",
    icon: UtensilsCrossed,
    titleKey: "module.menu.title",
    descKey: "module.menu.desc",
  },
  {
    id: "bill",
    path: "/bill",
    icon: Receipt,
    titleKey: "module.bill.title",
    descKey: "module.bill.desc",
  },
  {
    id: "procurement",
    path: "/procurement",
    icon: ShoppingBasket,
    titleKey: "module.procurement.title",
    descKey: "module.procurement.desc",
  },
] as const;

const Home = () => {
  const { t } = useT();

  return (
    <AppShell title={t("home.title")} subtitle={t("home.subtitle")} backTo="">
      <div className="mx-auto max-w-4xl">
        <p className="mb-8 text-center text-muted-foreground">{t("home.choose")}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {MODULES.map(({ id, path, icon: Icon, titleKey, descKey }) => (
            <Link
              key={id}
              to={path}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-gold"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-gold opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">{t(titleKey)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t(descKey)}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                {t("home.open")} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Home;
