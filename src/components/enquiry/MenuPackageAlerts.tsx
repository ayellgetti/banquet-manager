import {
  COMMON_PLATE_ITEMS,
  PLATE_PACKAGES,
  getSwappablePoolStatus,
} from "@/data/enquiryOptions";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { cn } from "@/lib/utils";

export type MenuPackageAlertsProps = {
  platePackageId: string;
  menuItemIds: string[];
  /** Hide swappable alert when user deferred dish selection (enquiry flow). */
  selectMenuLater?: boolean;
  /** Menu-selection workflow always shows swappable info when applicable. */
  isMenuSelection?: boolean;
  /** Highlight swappable alert when pool is incomplete (menu tab validation). */
  swappableInvalid?: boolean;
  /** Summary/PDF: show “dishes to be selected later” note. */
  showSelectLaterSummary?: boolean;
  className?: string;
};

export const MenuPackageAlerts = ({
  platePackageId,
  menuItemIds,
  selectMenuLater = false,
  isMenuSelection = false,
  swappableInvalid = false,
  showSelectLaterSummary = false,
  className,
}: MenuPackageAlertsProps) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const plate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
  const swappablePool = plate
    ? getSwappablePoolStatus(menuItemIds, plate.limits)
    : { selected: 0, required: 0, remaining: 0, isComplete: true };

  const showSwappable =
    !!platePackageId &&
    swappablePool.required > 0 &&
    (!selectMenuLater || isMenuSelection);

  if (!platePackageId && !showSelectLaterSummary) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {platePackageId && (
        <div className="menu-alert-muted rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{t("menu.includedEvery")}</span>{" "}
          {COMMON_PLATE_ITEMS.map(menuLabels.commonPlateName).join(" · ")}
        </div>
      )}

      {plate?.extras?.length ? (
        <div className="menu-alert-amber rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
          <div className="flex items-start gap-2">
            <span className="shrink-0 font-semibold">{plate.name}:</span>
            <span className="min-w-0 flex-1 leading-relaxed">{plate.extras.join(" · ")}</span>
          </div>
        </div>
      ) : null}

      {showSwappable && (
        <div
          className={cn(
            "menu-alert-info rounded-lg border p-3 text-xs",
            swappableInvalid
              ? "menu-alert-error border-destructive/50 bg-destructive/5 text-destructive"
              : "border-blue-200 bg-blue-50/80 text-blue-950",
          )}
        >
          <span className="font-semibold">{t("menu.swappablePoolTitle")}</span>{" "}
          {t("menu.swappablePoolDesc").replace("{n}", String(swappablePool.required))}
          <span className="mt-1 block font-medium tabular-nums">
            {swappablePool.selected}/{swappablePool.required} {t("menu.swappablePoolStatus")}
          </span>
        </div>
      )}

      {showSelectLaterSummary && selectMenuLater && (
        <div className="menu-alert-muted rounded-lg border bg-muted/40 p-3 text-xs italic text-muted-foreground">
          {t("menu.selectedLaterSummary")}
        </div>
      )}
    </div>
  );
};
