import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { LANGUAGES, useT } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const { t, lang, setLang } = useT();
  return (
    <div className="min-h-screen bg-background">
      <header className="no-print border-b bg-card">
        <div className="container flex flex-wrap items-start justify-between gap-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t("app.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("app.subtitle")}
            </p>
          </div>
          <div className="w-40">
            <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
              <SelectTrigger aria-label={t("lang.label")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <EnquiryForm />
      </main>
    </div>
  );
};

export default Index;
