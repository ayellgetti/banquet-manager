import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type EnquiryRecord } from "@/data/banquetData";
import { EVENT_TYPES, PACKAGES, PLATE_PACKAGES, VENUE_OPTIONS, getDefaultVenueId } from "@/data/enquiryOptions";
import { useConvertEnquiryMutation } from "@/hooks/useBanquetData";
import {
  getMinEventDateISO,
  sanitizeEventDate,
  validateEventDate,
} from "@/lib/eventDateValidation";
import { useT } from "@/i18n";
import { toast } from "sonner";

export type QuickBookingFormValues = {
  title: string;
  eventType: string;
  eventDate: string;
  timeSlotId: string;
  guestCount: number;
  venueId: string;
  menuPackageId: string;
  status: "confirmed" | "tentative";
};

const emptyForm = (defaultDate?: string): QuickBookingFormValues => ({
  title: "",
  eventType: "",
  eventDate: sanitizeEventDate(defaultDate),
  timeSlotId: "",
  guestCount: 100,
  venueId: getDefaultVenueId(),
  menuPackageId: "",
  status: "tentative",
});

const parseSlotLabel = (label: string): { time: string; endTime?: string } => {
  const match = label.match(/(\d{1,2}:\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}:\d{2})\s*(AM|PM)/i);
  if (!match) return { time: "18:00" };

  const to24 = (t: string, ap: string) => {
    const [h, m] = t.split(":").map(Number);
    const pm = ap.toUpperCase() === "PM";
    const hour = h === 12 ? (pm ? 12 : 0) : pm ? h + 12 : h;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return {
    time: to24(match[1], match[2]),
    endTime: to24(match[3], match[4]),
  };
};

const Req = () => (
  <span aria-hidden="true" className="ml-0.5 text-destructive">
    *
  </span>
);

type Props = {
  enquiry: EnquiryRecord;
  defaultDate?: string;
  defaultTitle?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export const QuickBookingForm = ({
  enquiry,
  defaultDate,
  defaultTitle,
  onSubmitted,
  onCancel,
}: Props) => {
  const { t } = useT();
  const convertMutation = useConvertEnquiryMutation();
  const [form, setForm] = useState<QuickBookingFormValues>(() => ({
    ...emptyForm(defaultDate ?? enquiry.preferredDate),
    eventType: enquiry.eventType,
    title: defaultTitle ?? "",
    guestCount: enquiry.guests,
  }));
  const [touched, setTouched] = useState(false);
  const minEventDate = getMinEventDateISO();

  useEffect(() => {
    if (defaultDate) {
      setForm((current) => ({ ...current, eventDate: sanitizeEventDate(defaultDate) }));
    }
  }, [defaultDate]);

  useEffect(() => {
    if (defaultTitle) {
      setForm((current) => ({ ...current, title: defaultTitle }));
    }
  }, [defaultTitle]);

  const update = <K extends keyof QuickBookingFormValues>(key: K, value: QuickBookingFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const errors = {
    title: !form.title.trim() ? t("bookings.validate.title") : null,
    eventType: !form.eventType.trim() ? t("validate.eventTypeRequired") : null,
    eventDate: validateEventDate(form.eventDate, t),
    timeSlot: !form.timeSlotId ? t("validate.timeSlotRequired") : null,
    guests: !form.guestCount || form.guestCount < 1 ? t("validate.guestsRequired") : null,
    venue: !form.venueId ? t("validate.venueRequired") : null,
    menu: !form.menuPackageId ? t("quickEnquiry.validate.menu") : null,
  };

  const show = (key: keyof typeof errors) => touched && errors[key];

  const handleSubmit = async () => {
    setTouched(true);
    const allErrors = Object.values(errors).filter(Boolean);
    if (allErrors.length) {
      toast.error(t("toast.fixErrors"));
      return;
    }

    const timeSlot = PACKAGES.find((pkg) => pkg.id === form.timeSlotId);
    const menu = PLATE_PACKAGES.find((pkg) => pkg.id === form.menuPackageId);
    const venue = VENUE_OPTIONS.find((item) => item.id === form.venueId);
    const slot = timeSlot?.slots?.[0];
    const { time, endTime } = parseSlotLabel(slot?.label ?? "");

    try {
      await convertMutation.mutateAsync({
        enquiryId: enquiry.id,
        title: form.title.trim(),
        eventType: form.eventType,
        date: form.eventDate,
        time,
        endTime,
        venue: venue?.name ?? "",
        status: form.status,
        guests: form.guestCount,
        revenue: enquiry.budget,
        menuPackage: menu?.name,
      });
      toast.success(t("bookings.submitSuccess"));
      onSubmitted?.();
    } catch {
      toast.error(t("bookings.submitFailed"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="qb-title">
            {t("bookings.form.title")}
            <Req />
          </Label>
          <Input
            id="qb-title"
            value={form.title}
            onChange={(e) => update("title", e.target.value.slice(0, 120))}
            placeholder={t("bookings.form.title.ph")}
            aria-invalid={!!show("title")}
            className={show("title") ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {show("title") && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            {t("basics.eventType")}
            <Req />
          </Label>
          <Select value={form.eventType} onValueChange={(v) => update("eventType", v)}>
            <SelectTrigger aria-invalid={!!show("eventType")} className={show("eventType") ? "border-destructive" : ""}>
              <SelectValue placeholder={t("basics.eventType.ph")} />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((event) => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {show("eventType") && <p className="text-xs text-destructive">{errors.eventType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="qb-eventDate">
            {t("bookings.col.date")}
            <Req />
          </Label>
          <Input
            id="qb-eventDate"
            type="date"
            min={minEventDate}
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            aria-invalid={!!show("eventDate")}
            className={show("eventDate") ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {show("eventDate") && <p className="text-xs text-destructive">{errors.eventDate}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            {t("enquiryV2.timeSlot")}
            <Req />
          </Label>
          <Select value={form.timeSlotId} onValueChange={(v) => update("timeSlotId", v)}>
            <SelectTrigger aria-invalid={!!show("timeSlot")} className={show("timeSlot") ? "border-destructive" : ""}>
              <SelectValue placeholder={t("enquiryV2.timeSlot.ph")} />
            </SelectTrigger>
            <SelectContent>
              {PACKAGES.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.slots?.[0]?.label ?? pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {show("timeSlot") && <p className="text-xs text-destructive">{errors.timeSlot}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="qb-guests">
            {t("basics.guests")}
            <Req />
          </Label>
          <Input
            id="qb-guests"
            type="number"
            min={1}
            max={10000}
            value={form.guestCount}
            onChange={(e) => update("guestCount", Math.max(0, Math.min(10000, Number(e.target.value) || 0)))}
            aria-invalid={!!show("guests")}
            className={show("guests") ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {show("guests") && <p className="text-xs text-destructive">{errors.guests}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            {t("venue.title")}
            <Req />
          </Label>
          <Select value={form.venueId} onValueChange={(v) => update("venueId", v)}>
            <SelectTrigger aria-invalid={!!show("venue")} className={show("venue") ? "border-destructive" : ""}>
              <SelectValue placeholder={t("enquiryV2.venue.ph")} />
            </SelectTrigger>
            <SelectContent>
              {VENUE_OPTIONS.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {show("venue") && <p className="text-xs text-destructive">{errors.venue}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            {t("quickEnquiry.menu")}
            <Req />
          </Label>
          <Select value={form.menuPackageId} onValueChange={(v) => update("menuPackageId", v)}>
            <SelectTrigger aria-invalid={!!show("menu")} className={show("menu") ? "border-destructive" : ""}>
              <SelectValue placeholder={t("quickEnquiry.menu.ph")} />
            </SelectTrigger>
            <SelectContent>
              {PLATE_PACKAGES.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} — ₹{pkg.basePrice}/plate
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {show("menu") && <p className="text-xs text-destructive">{errors.menu}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("bookings.col.status")}</Label>
          <Select value={form.status} onValueChange={(v) => update("status", v as QuickBookingFormValues["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tentative">{t("bookings.status.tentative")}</SelectItem>
              <SelectItem value="confirmed">{t("bookings.status.confirmed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={convertMutation.isPending}>
            {t("common.cancel")}
          </Button>
        )}
        <Button
          type="button"
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          disabled={convertMutation.isPending}
          onClick={() => void handleSubmit()}
        >
          {convertMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {convertMutation.isPending ? t("bookings.submitting") : t("bookings.submit")}
        </Button>
      </div>
    </div>
  );
};
