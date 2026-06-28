import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ADMIN_NAV_ITEMS, EXTRA_NAV_ITEMS, isAdminNavActive, isExtraNavPath } from "@/config/adminNav";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

const linkClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-gradient-gold text-primary-foreground shadow-gold"
      : "text-white/75 hover:bg-white/10 hover:text-white",
  );

const subLinkClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-2.5 rounded-lg py-2 pl-9 pr-3 text-[13px] font-medium transition-colors",
    isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white/90",
  );

export const AdminNavLinks = ({ onNavigate, className }: Props) => {
  const { t } = useT();
  const { pathname } = useLocation();
  const extraActive = isExtraNavPath(pathname);
  const mainItems = ADMIN_NAV_ITEMS.filter((item) => item.id !== "extra");
  const extraItem = ADMIN_NAV_ITEMS.find((item) => item.id === "extra")!;
  const [extraOpen, setExtraOpen] = useState(extraActive);

  useEffect(() => {
    if (extraActive) setExtraOpen(true);
  }, [extraActive]);

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label={t("admin.nav.label")}>
      {mainItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive)}
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t(item.titleKey)}</span>
        </NavLink>
      ))}

      <Collapsible open={extraOpen} onOpenChange={setExtraOpen} className="mt-1">
        <div className={cn("flex items-center gap-0.5 rounded-lg", extraActive && "bg-gradient-gold shadow-gold")}>
          <NavLink
            to={extraItem.path}
            end
            onClick={onNavigate}
            className={() =>
              cn(
                "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                extraActive
                  ? "text-primary-foreground"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )
            }
            aria-current={extraActive && pathname === extraItem.path ? "page" : undefined}
          >
            <extraItem.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t(extraItem.titleKey)}</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setExtraOpen((open) => !open)}
            className={cn(
              "mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
              extraActive ? "text-primary-foreground hover:bg-black/10" : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
            aria-expanded={extraOpen}
            aria-label={t("admin.nav.toggleExtra")}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", !extraOpen && "-rotate-90")}
              aria-hidden="true"
            />
          </button>
        </div>

        <CollapsibleContent className="mt-0.5 flex flex-col gap-0.5 overflow-hidden">
          {EXTRA_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={() => subLinkClass(isAdminNavActive(pathname, item))}
              aria-current={isAdminNavActive(pathname, item) ? "page" : undefined}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
              <span className="truncate">{t(item.titleKey)}</span>
            </NavLink>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );
};
