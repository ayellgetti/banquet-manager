import { NavLink } from "react-router-dom";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

export const AdminNavLinks = ({ onNavigate, className }: Props) => {
  const { t } = useT();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label={t("admin.nav.label")}>
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-gradient-gold text-primary-foreground shadow-gold"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t(item.titleKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
};
