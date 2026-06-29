import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGES, useT } from "@/i18n";

const SettingsPage = () => {
  const { t, lang, setLang } = useT();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("settings.preferences")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.preferencesDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-language">{t("lang.label")}</Label>
            <Select value={lang} onValueChange={(value) => setLang(value as typeof lang)}>
              <SelectTrigger id="settings-language" className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("settings.account")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.accountDesc")}</p>
          </div>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
            {t("profile.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
