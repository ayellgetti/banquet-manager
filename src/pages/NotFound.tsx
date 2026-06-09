import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useT();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {t("app.title")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">{t("notFound.message")}</p>
        <Button asChild className="mt-6 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
          <Link to="/">{t("notFound.home")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
