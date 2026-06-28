import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DecorationMultiSelect } from "@/components/enquiry/DecorationMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  APPROX_BUDGET_RANGES,
  DECOR_OPTIONS,
  EVENT_TYPES,
  PACKAGES,
  PLATE_PACKAGES,
  SOURCES,
  VENUE_OPTIONS,
  getDefaultVenueId,
} from "@/data/enquiryOptions";
import { submitEnquiryLead, type EnquiryLeadPayload } from "@/lib/enquiryApi";
import {
  getMinEventDateISO,
  sanitizeEventDate,
  validateEventDate,
} from "@/lib/eventDateValidation";
import { useT } from "@/i18n";
import { toast } from "sonner";

export type QuickEnquiryFormValues = {
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlotId: string;
  guestCount: number;
  venueId: string;
  source: string;
  approxBudget: string;
  menuPackageId: string;
  decorationIds: string[];
};

const emptyForm = (defaultDate?: string): QuickEnquiryFormValues => ({
  customerName: "",
  phone: "",
  eventType: "",
  eventDate: sanitizeEventDate(defaultDate),
  timeSlotId: "",
  guestCount: 100,
  venueId: getDefaultVenueId(),
  source: "",
  approxBudget: "",
  menuPackageId: "",
  decorationIds: [],
});

const Req = () => (
  <span aria-hidden="true" className="ml-0.5 text-destructive">
    *
  </span>
);

const NAME_RE = /^[\p{L}\p{M}\s.\-']+$/u;

type Props = {
  defaultDate?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export const QuickEnquiryForm = ({ defaultDate, onSubmitted, onCancel }: Props) => {
  const { t } = useT();
  const [form, setForm] = useState<QuickEnquiryFormValues>(() => emptyForm(defaultDate));
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setForm((current) => ({ ...current, eventDate: sanitizeEventDate(defaultDate) }));
    }
  }, [defaultDate]);

  const minEventDate = getMinEventDateISO();

  const update = <K extends keyof QuickEnquiryFormValues>(key: K, value: QuickEnquiryFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateName = (raw: string) => {
    const v = raw.trim();
    if (!v) return t("validate.nameRequired");
    if (v.length < 2) return t("validate.nameShort");
    if (!NAME_RE.test(v)) return t("validate.nameInvalid");
    return null;
  };

  const validatePhone = (raw: string) => {
    const v = raw.trim();
    if (!v) return t("validate.phoneRequired");
    if (v.replace(/\D/g, "").length !== 10) return t("validate.phoneInvalid");
    return null;
  };

  const errors = {
    name: validateName(form.customerName),
    phone: validatePhone(form.phone),
    eventType: !form.eventType.trim() ? t("validate.eventTypeRequired") : null,
    eventDate: validateEventDate(form.eventDate, t),
    timeSlot: !form.timeSlotId ? t("validate.timeSlotRequired") : null,
    guests: !form.guestCount || form.guestCount < 1 ? t("validate.guestsRequired") : null,
    venue: !form.venueId ? t("validate.venueRequired") : null,
    source: !form.source.trim() ? t("validate.sourceRequired") : null,
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
    const decorations = DECOR_OPTIONS.filter((item) => form.decorationIds.includes(item.id)).map(
      (item) => item.name,
    );

    const payload: EnquiryLeadPayload = {
      name: form.customerName.trim(),
      mobileNo: form.phone.trim(),
      eventDate: form.eventDate,
      eventSlot: timeSlot?.slots?.[0]?.label ?? timeSlot?.name ?? "",
      eventMenuRange: menu ? `${menu.name} (₹${menu.basePrice}/plate)` : "",
      eventNumberOfGuest: String(form.guestCount),
      eventType: form.eventType,
      eventAdditionDetail: [
        venue ? `Venue: ${venue.name}` : "",
        `Source: ${form.source}`,
        form.approxBudget ? `Approx budget: ${form.approxBudget}` : "",
        decorations.length ? `Decoration: ${decorations.join(", ")}` : "",
        "Module: Quick Enquiry Modal",
      ]
        .filter(Boolean)
        .join("\n"),
    };

    setIsSubmitting(true);
    try {
      await submitEnquiryLead(payload);
      toast.success(t("enquiryV2.submitSuccess"));
      setForm(emptyForm(defaultDate));
      setTouched(false);
      onSubmitted?.();
    } catch {
      toast.error(t("toast.leadSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="qe-customerName">
              {t("basics.customerName")}
              <Req />
            </Label>
            <Input
              id="qe-customerName"
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value.slice(0, 100))}
              placeholder={t("basics.customerName.ph")}
              aria-invalid={!!show("name")}
              className={show("name") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {show("name") && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qe-phone">
              {t("basics.phone")}
              <Req />
            </Label>
            <Input
              id="qe-phone"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              maxLength={10}
              aria-invalid={!!show("phone")}
              className={show("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {show("phone") && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <Label htmlFor="qe-eventDate">
              {t("basics.eventDate")}
              <Req />
            </Label>
            <Input
              id="qe-eventDate"
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
            <Label htmlFor="qe-guests">
              {t("basics.guests")}
              <Req />
            </Label>
            <Input
              id="qe-guests"
              type="number"
              min={1}
              max={10000}
              value={form.guestCount}
              onChange={(e) =>
                update("guestCount", Math.max(0, Math.min(10000, Number(e.target.value) || 0)))
              }
              aria-invalid={!!show("guests")}
              className={show("guests") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {show("guests") && <p className="text-xs text-destructive">{errors.guests}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              {t("basics.source")}
              <Req />
            </Label>
            <Select value={form.source} onValueChange={(v) => update("source", v)}>
              <SelectTrigger aria-invalid={!!show("source")} className={show("source") ? "border-destructive" : ""}>
                <SelectValue placeholder={t("basics.source.ph")} />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {show("source") && <p className="text-xs text-destructive">{errors.source}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("basics.approxBudget")}</Label>
            <Select value={form.approxBudget} onValueChange={(v) => update("approxBudget", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("basics.approxBudget.ph")} />
              </SelectTrigger>
              <SelectContent>
                {APPROX_BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Label>{t("quickEnquiry.decoration")}</Label>
            <DecorationMultiSelect
              options={DECOR_OPTIONS.map((item) => ({ id: item.id, name: item.name }))}
              value={form.decorationIds}
              onChange={(value) => update("decorationIds", value)}
              placeholder={t("quickEnquiry.decoration.ph")}
              searchPlaceholder={t("quickEnquiry.decoration.search")}
              emptyLabel={t("quickEnquiry.decoration.empty")}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
        )}
        <Button
          type="button"
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? t("enquiryV2.submitting") : t("enquiryV2.submit")}
        </Button>
      </div>
    </div>
  );
};
