import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { MenuDishSelector } from "@/components/bookings/MenuDishSelector";
import { Button } from "@/components/ui/button";
import type { BookingRecord } from "@/data/banquetData";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { fetchEventByIdFromApi, saveMenuSelectionViaApi } from "@/lib/eventsApi";
import { buildMenuPackageLabel, mapEventToMenuEnquiryState } from "@/lib/menuSelectionMapper";
import { validateMenuSelection } from "@/lib/menuSelectionValidation";
import { useT } from "@/i18n";
import { useMenuLabels } from "@/i18n/menuLabels";
import { toast } from "sonner";

type Props = {
  booking: BookingRecord;
};

export const BookingMenuSelection = ({ booking }: Props) => {
  const { t } = useT();
  const menuLabels = useMenuLabels();
  const queryClient = useQueryClient();
  const [platePackageId, setPlatePackageId] = useState(booking.platePackageId ?? "");
  const [menuItemIds, setMenuItemIds] = useState<string[]>([]);
  const [lockPlatePackage, setLockPlatePackage] = useState(false);
  const [guestCount, setGuestCount] = useState(booking.guests || 100);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [savedMenuPackage, setSavedMenuPackage] = useState(booking.menuPackage);

  useEffect(() => {
    if (!booking.eventId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void fetchEventByIdFromApi(booking.eventId)
      .then((event) => {
        if (cancelled) return;
        const mapped = mapEventToMenuEnquiryState(event);
        const resolvedPlate = mapped.platePackageId;
        setPlatePackageId(resolvedPlate);
        setMenuItemIds(mapped.menuItemIds);
        setGuestCount(mapped.basics.guestCount || booking.guests || 100);
        setLockPlatePackage(Boolean(resolvedPlate));
        setSavedMenuPackage(event.menuPackage ?? booking.menuPackage);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("menuSelection.loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [booking.eventId, booking.guests, booking.menuPackage, t]);

  const handleSave = async () => {
    if (!booking.eventId) return;

    setShowValidation(true);
    const errors = validateMenuSelection(
      { platePackageId, menuItemIds, guestCount },
      t,
      { checkMinPax: true, categoryLabel: menuLabels.categoryName },
    );

    if (errors.length) {
      toast.error(t("toast.fixErrors"), {
        description: (
          <ul className="ml-4 list-disc space-y-0.5 text-white">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveMenuSelectionViaApi(booking.eventId, {
        platePackageId,
        menuItemIds,
        menuPackage: buildMenuPackageLabel(platePackageId),
        guestCount,
      });
      setSavedMenuPackage(saved.menuPackage);
      setLockPlatePackage(Boolean(platePackageId));
      await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.bookings() });
      toast.success(t("menuSelection.saved"));
    } catch {
      toast.error(t("menuSelection.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!booking.eventId) {
    return <p className="text-sm text-muted-foreground">{t("bookings.menuNoEvent")}</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("menuSelection.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedMenuPackage ? (
        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("bookings.menuPackage")}
          </p>
          <p className="mt-1 font-medium text-foreground">{savedMenuPackage}</p>
          {menuItemIds.length > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("bookings.menuItemCount").replace("{count}", String(menuItemIds.length))}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">{t("menuSelection.menuDesc")}</p>

      <MenuDishSelector
        platePackageId={platePackageId}
        menuItemIds={menuItemIds}
        onPlatePackageChange={setPlatePackageId}
        onMenuItemIdsChange={setMenuItemIds}
        lockPlatePackage={lockPlatePackage}
        guestCount={guestCount}
        showValidation={showValidation}
      />

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? t("menuSelection.saving") : t("menuSelection.save")}
        </Button>
      </div>
    </div>
  );
};
