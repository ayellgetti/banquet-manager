import { PLATE_PACKAGES, getPackageCategoryLabel, sortMenuCategories } from "@/data/enquiryOptions";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const ALL_CATEGORIES = sortMenuCategories(
  Array.from(new Set(PLATE_PACKAGES.flatMap((p) => Object.keys(p.limits)))),
);

type PlatePackageComparisonProps = {
  selectedId: string;
  onSelect?: (id: string) => void;
  invalid?: boolean;
};

type PackageSelectToggleProps = {
  packageId: string;
  isSel: boolean;
  interactive: boolean;
  onPrimary?: boolean;
  fullWidth?: boolean;
  onToggle: (id: string) => void;
};

const PackageSelectToggle = ({
  packageId,
  isSel,
  interactive,
  onPrimary = false,
  fullWidth = false,
  onToggle,
}: PackageSelectToggleProps) => {
  const { t } = useT();

  if (!interactive && !isSel) return null;

  const className = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
    fullWidth && "w-full",
    !interactive && "pointer-events-none",
    isSel
      ? onPrimary
        ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
        : "border-primary bg-primary/10 text-primary shadow-sm"
      : onPrimary
        ? "border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50",
    interactive && "cursor-pointer",
  );

  const label = isSel ? t("menu.selectedPackage") : t("menu.selectPackage");

  if (!interactive) {
    return (
      <div className={className} aria-label={t("menu.selectedPackage")}>
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
            onPrimary
              ? "border-primary-foreground bg-primary-foreground text-primary"
              : "border-primary bg-primary text-primary-foreground",
          )}
        >
          <Check className="h-3 w-3" />
        </span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      aria-pressed={isSel}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(packageId);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(packageId);
        }
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          isSel
            ? onPrimary
              ? "border-primary-foreground bg-primary-foreground text-primary"
              : "border-primary bg-primary text-primary-foreground"
            : onPrimary
              ? "border-primary-foreground/40 bg-transparent"
              : "border-border bg-background",
        )}
      >
        {isSel ? <Check className="h-3 w-3" /> : null}
      </span>
      <span>{label}</span>
    </div>
  );
};

export const PlatePackageComparison = ({
  selectedId,
  onSelect,
  invalid,
}: PlatePackageComparisonProps) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const interactive = !!onSelect;

  const handleToggle = (id: string) => {
    if (!onSelect) return;
    onSelect(selectedId === id ? "" : id);
  };

  const wrapperClass = cn(
    "rounded-lg border",
    invalid && interactive && "ring-2 ring-destructive/60",
  );

  return (
    <>
      <div className={cn("plate-package-mobile space-y-3 md:hidden", wrapperClass, interactive && "p-2")}>
        {PLATE_PACKAGES.map((p) => {
          const isSel = selectedId === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors",
                isSel
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                  : "border-border bg-background",
              )}
            >
              <PackageSelectToggle
                packageId={p.id}
                isSel={isSel}
                interactive={interactive}
                fullWidth
                onToggle={handleToggle}
              />
              <div className="mt-3">
                <div className="font-semibold text-foreground">{p.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {p.basePrice > 0 ? `₹${p.basePrice}/plate` : t("menu.customPlate")}
                  {p.minPax != null && (
                    <span className="mt-0.5 block font-medium text-foreground/80">
                      {t("menu.minPax").replace("{n}", String(p.minPax))}
                    </span>
                  )}
                </div>
              </div>
              {Object.keys(p.limits).length > 0 ? (
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {ALL_CATEGORIES.map((cat) => {
                    const n = (p.limits as Record<string, number>)[cat];
                    if (n == null) return null;
                    return (
                      <div key={cat} className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">
                          {getPackageCategoryLabel(p, cat, menuLabels.categoryName)}
                        </dt>
                        <dd className="font-medium tabular-nums text-foreground">{n}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">{t("menu.customPlateDesc")}</p>
              )}
              {p.extras?.length ? (
                <div className="mt-3 border-t pt-2">
                  <p className="text-xs leading-relaxed text-amber-950">{p.extras.join(" · ")}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={cn("plate-package-table hidden md:block", wrapperClass, "overflow-x-auto")}>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/40 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("menu.category")}
              </th>
              {PLATE_PACKAGES.map((p) => {
                const isSel = selectedId === p.id;
                return (
                  <th
                    key={p.id}
                    className={cn(
                      "min-w-[120px] border-l px-3 py-3 text-center align-top",
                      isSel ? "bg-primary text-primary-foreground" : "bg-background",
                    )}
                  >
                    <PackageSelectToggle
                      packageId={p.id}
                      isSel={isSel}
                      interactive={interactive}
                      onPrimary={isSel}
                      onToggle={handleToggle}
                    />
                    <div className="mt-2 text-sm font-semibold">{p.name}</div>
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        isSel ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {p.basePrice > 0 ? `₹${p.basePrice}/plate` : "—"}
                      {p.minPax != null && (
                        <div className={cn("mt-0.5 font-medium", isSel ? "text-primary-foreground/90" : "text-foreground/70")}>
                          {t("menu.minPax").replace("{n}", String(p.minPax))}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ALL_CATEGORIES.map((cat) => (
              <tr key={cat} className="border-t">
                <td className="sticky left-0 z-10 bg-background px-3 py-2 text-xs font-medium text-foreground">
                  {menuLabels.categoryName(cat)}
                </td>
                {PLATE_PACKAGES.map((p) => {
                  const isSel = selectedId === p.id;
                  const n = (p.limits as Record<string, number>)[cat];
                  return (
                    <td
                      key={p.id}
                      className={cn(
                        "border-l px-3 py-2 text-center tabular-nums",
                        isSel ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {n ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t bg-amber-50/50">
              <td className="sticky left-0 z-10 bg-amber-50/50 px-3 py-2 text-xs font-medium text-foreground align-top">
                {t("menu.packageNotes")}
              </td>
              {PLATE_PACKAGES.map((p) => {
                const isSel = selectedId === p.id;
                return (
                  <td
                    key={p.id}
                    className={cn(
                      "border-l px-3 py-2 text-left text-xs leading-relaxed text-amber-950 align-top",
                      isSel ? "bg-primary/10" : "",
                    )}
                  >
                    {p.extras?.length ? p.extras.join(" · ") : "—"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
