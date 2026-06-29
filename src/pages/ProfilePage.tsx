import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";

const ProfilePage = () => {
  const { t } = useT();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const displayName = `${user.firstName} ${user.lastName}`.replace(/\s+\./g, "").trim() || user.username;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-xl font-bold text-primary-foreground shadow-gold">
              {displayName
                .split(/\s+/)
                .filter(Boolean)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-5">
              <h2 className="font-display text-2xl font-semibold">{displayName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("profile.username")}
              </dt>
              <dd className="mt-1 text-sm font-medium">{user.username}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("profile.email")}
              </dt>
              <dd className="mt-1 text-sm font-medium">{user.email || "—"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex justify-end">
            <Button type="button" variant="outline" className="gap-2" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" />
              {t("profile.logout")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
