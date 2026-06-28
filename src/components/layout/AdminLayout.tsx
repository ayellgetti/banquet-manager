import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { getAdminNavItem } from "@/config/adminNav";
import { AdminNavLinks } from "@/components/layout/AdminNavLinks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, useT } from "@/i18n";

export const AdminLayout = () => {
  const { t, lang, setLang } = useT();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = getAdminNavItem(pathname);
  const appName = t("app.title");

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <Link
        to="/calendar"
        className="mb-6 flex shrink-0 items-center gap-3 rounded-xl px-2 py-1 transition-opacity hover:opacity-90"
        onClick={() => setMobileOpen(false)}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-base font-bold text-primary-foreground shadow-gold">
          ✦
        </span>
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-bold text-white">{appName}</p>
          <p className="truncate text-[11px] uppercase tracking-wider text-white/50">{t("admin.badge")}</p>
        </div>
      </Link>

      <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <AdminNavLinks onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
        <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
          <SelectTrigger
            aria-label={t("lang.label")}
            className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.native}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden h-svh w-64 flex-col overflow-hidden border-r border-border/70 bg-gradient-noir p-5 md:flex">
        {sidebar}
      </aside>

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="no-print sticky top-0 z-30 border-b border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden" aria-label={t("admin.nav.open")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-72 flex-col overflow-hidden border-r bg-gradient-noir p-5 text-white">
                <SheetHeader className="sr-only">
                  <SheetTitle>{t("admin.nav.label")}</SheetTitle>
                </SheetHeader>
                {sidebar}
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {appName}
              </p>
              <h1 className="font-display truncate text-xl font-bold tracking-tight sm:text-2xl">
                {t(active.titleKey)}
              </h1>
              <p className="truncate text-sm text-muted-foreground">{t(active.subtitleKey)}</p>
            </div>

            <div className="hidden w-40 shrink-0 md:block lg:hidden">
              <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
                <SelectTrigger aria-label={t("lang.label")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.native}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
