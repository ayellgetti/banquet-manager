import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { BORDER_GOLD, BOX_BORDER, BROWN, CARD_FONT, CREAM, GOLD, GOLD_LIGHT } from "@/components/visiting-card/cardTheme";

export type ClientDetails = {
  name: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlot: string;
  guestCount: string;
  source: string;
  decoration: string;
};

export const emptyClientDetails = (): ClientDetails => ({
  name: "",
  phone: "",
  eventType: "",
  eventDate: "",
  timeSlot: "",
  guestCount: "",
  source: "",
  decoration: "",
});

type ClientDetailsSectionProps = {
  value: ClientDetails;
  onChange: (value: ClientDetails) => void;
  className?: string;
};

const Req = () => <span aria-hidden="true" className="text-destructive">*</span>;

const Field = ({
  id,
  label,
  required,
  labelClassName,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  labelClassName?: string;
  children: ReactNode;
}) => (
  <div className="client-detail-field min-w-0 space-y-0">
    <label
      htmlFor={id}
      className={cn(
        "client-detail-label text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
        labelClassName,
      )}
      style={{ color: GOLD }}
    >
      {label}
      {required ? <Req /> : null}
    </label>
    {children}
  </div>
);

const clientInputClass =
  "client-detail-input h-6 border bg-white px-1.5 py-0 text-[11px] leading-tight shadow-none focus-visible:ring-1 sm:text-[12px]";

export const ClientDetailsSection = ({ value, onChange, className }: ClientDetailsSectionProps) => {
  const { t } = useT();

  const update = <K extends keyof ClientDetails>(key: K, next: ClientDetails[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <section
      className={cn("overflow-hidden rounded-lg border bg-white shadow-soft", className)}
      data-client-details-section
      style={{ border: BORDER_GOLD, fontFamily: CARD_FONT }}
    >
      <div
        className="client-detail-header border-b px-2 py-1 text-center"
        style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
      >
        <p className="text-xs font-bold leading-none sm:text-sm" style={{ color: GOLD }}>
          {t("menuPackageCard.client.title")}
        </p>
      </div>

      <div className="client-detail-body px-2 py-1.5" style={{ backgroundColor: CREAM }}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-1.5">
          <Field id="client-name" label={t("menuPackageCard.client.name")}>
            <Input
              id="client-name"
              value={value.name}
              onChange={(e) => update("name", e.target.value.slice(0, 100))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>

          <Field
            id="client-phone"
            label={t("menuPackageCard.client.mobile")}
            labelClassName="text-[11px] tracking-[0.06em] sm:text-[12px]"
          >
            <Input
              id="client-phone"
              inputMode="tel"
              value={value.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={cn(clientInputClass, "client-detail-phone text-[12px] font-semibold sm:text-[13px]")}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
              maxLength={10}
            />
          </Field>

          <Field id="client-event-type" label={t("basics.eventType")}>
            <Input
              id="client-event-type"
              value={value.eventType}
              onChange={(e) => update("eventType", e.target.value.slice(0, 120))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>

          <Field id="client-event-date" label={t("basics.eventDate")}>
            <Input
              id="client-event-date"
              value={value.eventDate}
              onChange={(e) => update("eventDate", e.target.value.slice(0, 40))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>

          <Field id="client-time-slot" label={t("enquiryV2.timeSlot")}>
            <Input
              id="client-time-slot"
              value={value.timeSlot}
              onChange={(e) => update("timeSlot", e.target.value.slice(0, 120))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>

          <Field id="client-guests" label={t("basics.guests")}>
            <Input
              id="client-guests"
              inputMode="numeric"
              value={value.guestCount}
              onChange={(e) => update("guestCount", e.target.value.replace(/\D/g, "").slice(0, 5))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>

          <Field id="client-source" label={t("basics.source")} required>
            <Input
              id="client-source"
              value={value.source}
              onChange={(e) => update("source", e.target.value.slice(0, 80))}
              className={clientInputClass}
              style={{ border: BOX_BORDER, color: BROWN }}
              aria-required="true"
            />
          </Field>

          <Field id="client-decoration" label={t("decor.title")}>
            <Input
              id="client-decoration"
              value={value.decoration}
              onChange={(e) => update("decoration", e.target.value.slice(0, 200))}
              className={clientInputClass}
              style={{ borderColor: GOLD_LIGHT, color: BROWN }}
            />
          </Field>
        </div>
      </div>
    </section>
  );
};

export function formatClientDetailsBlock(client: ClientDetails, t: (key: string) => string): string[] {
  const lines: string[] = [];
  if (client.name.trim()) lines.push(`${t("menuPackageCard.client.name")}: ${client.name.trim()}`);
  if (client.phone.trim()) lines.push(`${t("menuPackageCard.client.mobile")}: ${client.phone.trim()}`);
  if (client.eventType.trim()) lines.push(`${t("basics.eventType")}: ${client.eventType.trim()}`);
  if (client.eventDate.trim()) lines.push(`${t("basics.eventDate")}: ${client.eventDate.trim()}`);
  if (client.timeSlot.trim()) lines.push(`${t("enquiryV2.timeSlot")}: ${client.timeSlot.trim()}`);
  if (client.guestCount.trim()) lines.push(`${t("basics.guests")}: ${client.guestCount.trim()}`);
  if (client.source.trim()) lines.push(`${t("basics.source")}: ${client.source.trim()}`);
  if (client.decoration.trim()) lines.push(`${t("decor.title")}: ${client.decoration.trim()}`);
  return lines;
}
