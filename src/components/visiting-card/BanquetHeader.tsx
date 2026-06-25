import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  VISITING_CARD_ADDRESS,
  VISITING_CARD_BUSINESS_NAME,
  VISITING_CARD_CONTACTS,
  VISITING_CARD_LOGO,
  phoneTel,
  phoneWhatsApp,
} from "@/data/visitingCard";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { BORDER_GOLD, BORDER_SIMPLE, BOX_BORDER, BROWN, CARD_FONT, CREAM, GOLD, GOLD_LIGHT } from "./cardTheme";

type BanquetHeaderProps = {
  className?: string;
  /** Flush inside a parent card — no outer border or corner radius */
  embedded?: boolean;
  /** Structured contact rows with call & WhatsApp actions (visiting card) */
  showContactActions?: boolean;
  /** Tighter layout for A4 menu package print — same fonts, less padding */
  compact?: boolean;
};

const ContactActionLink = ({
  href,
  label,
  children,
  variant,
  simple,
}: {
  href: string;
  label: string;
  children: ReactNode;
  variant: "phone" | "whatsapp";
  simple?: boolean;
}) => (
  <a
    href={href}
    target={variant === "whatsapp" ? "_blank" : undefined}
    rel={variant === "whatsapp" ? "noopener noreferrer" : undefined}
    className={cn(
      "no-print inline-flex h-7 w-7 items-center justify-center transition hover:opacity-80",
      simple ? "rounded-sm" : "rounded-md border bg-white hover:opacity-90",
    )}
    style={
      simple
        ? undefined
        : {
            borderColor: variant === "whatsapp" ? "#86efac" : GOLD_LIGHT,
            backgroundColor: variant === "whatsapp" ? "#f0fdf4" : "#ffffff",
          }
    }
    aria-label={label}
  >
    {children}
  </a>
);

export const BanquetHeader = ({
  className,
  embedded = false,
  showContactActions = false,
  compact = false,
}: BanquetHeaderProps) => {
  const { t } = useT();
  const simpleBorders = embedded && showContactActions;

  return (
    <header
      className={cn(
        "overflow-hidden",
        embedded ? "" : "rounded-lg border bg-white shadow-soft",
        className,
      )}
      data-banquet-header
      data-compact={compact || undefined}
      style={{
        border: embedded ? undefined : BORDER_GOLD,
        backgroundColor: embedded ? undefined : "#ffffff",
        fontFamily: CARD_FONT,
      }}
    >
      {showContactActions && compact ? (
        <div className="banquet-header-compact grid grid-cols-[minmax(0,1fr)_minmax(0,36%)] items-start">
          <div
            className="banquet-header-brand flex min-w-0 items-start gap-2 border-r px-2 py-2"
            style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
          >
            <img
              src={VISITING_CARD_LOGO}
              alt={VISITING_CARD_BUSINESS_NAME}
              className="banquet-header-logo h-auto w-16 shrink-0 object-contain"
              crossOrigin="anonymous"
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-base font-bold leading-tight sm:text-lg" style={{ color: GOLD }}>
                {VISITING_CARD_BUSINESS_NAME}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug sm:text-xs" style={{ color: BROWN }}>
                {VISITING_CARD_ADDRESS}
              </p>
            </div>
          </div>

          <div className="banquet-header-contacts px-2 py-2" style={{ backgroundColor: CREAM }}>
            <p
              className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: GOLD }}
            >
              {t("visitingCard.contactsLabel")}
            </p>
            <ul className="space-y-1">
              {VISITING_CARD_CONTACTS.map((contact) => (
                <li
                  key={contact.phone}
                  className="banquet-header-contact flex items-start justify-between gap-1"
                >
                  <div className="min-w-0 flex-1 text-left leading-snug">
                    <span className="text-[11px] font-semibold sm:text-[12px]" style={{ color: BROWN }}>
                      {contact.name}
                    </span>
                    <span className="mx-0.5 text-[10px] sm:text-[11px]" style={{ color: BROWN }}>
                      ·
                    </span>
                    <span className="banquet-header-phone text-[12px] font-bold tabular-nums tracking-wide sm:text-[13px]" style={{ color: BROWN }}>
                      {contact.phone}
                    </span>
                  </div>
                  <div className="no-print flex shrink-0 items-center gap-1">
                    <ContactActionLink
                      href={`tel:${phoneTel(contact.phone)}`}
                      label={`${t("visitingCard.call")} ${contact.name}`}
                      variant="phone"
                      simple={simpleBorders}
                    >
                      <Phone className="h-3.5 w-3.5" style={{ color: GOLD }} aria-hidden="true" />
                    </ContactActionLink>
                    <ContactActionLink
                      href={`https://wa.me/${phoneWhatsApp(contact.phone)}`}
                      label={`WhatsApp ${contact.name}`}
                      variant="whatsapp"
                      simple={simpleBorders}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" aria-hidden="true" />
                    </ContactActionLink>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : showContactActions ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(220px,280px)] md:items-stretch">
          <div
            className="border-b px-4 py-3 md:border-b-0 md:border-r md:py-3.5"
            style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1 text-left">
                <p className="text-base font-bold leading-tight sm:text-lg" style={{ color: GOLD }}>
                  {VISITING_CARD_BUSINESS_NAME}
                </p>
                <p className="mt-1 text-[11px] leading-snug sm:text-xs" style={{ color: BROWN }}>
                  {VISITING_CARD_ADDRESS}
                </p>
              </div>
              <img
                src={VISITING_CARD_LOGO}
                alt={VISITING_CARD_BUSINESS_NAME}
                className="h-auto w-14 shrink-0 object-contain sm:w-16"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="px-4 py-3 md:py-3.5" style={{ backgroundColor: CREAM }}>
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: GOLD }}
            >
              {t("visitingCard.contactsLabel")}
            </p>
            <ul className="grid gap-2">
              {VISITING_CARD_CONTACTS.map((contact) => (
                <li
                  key={contact.phone}
                  className="flex items-center justify-between gap-3 rounded-md border px-2.5 py-2"
                  style={{
                    border: simpleBorders ? BORDER_SIMPLE : BOX_BORDER,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className="break-words text-[11px] font-semibold leading-snug sm:text-[12px]"
                      style={{ color: BROWN }}
                    >
                      {contact.name}
                    </p>
                    <p
                      className="mt-0.5 break-all text-[10px] tabular-nums leading-snug sm:text-[11px]"
                      style={{ color: BROWN }}
                    >
                      {contact.phone}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ContactActionLink
                      href={`tel:${phoneTel(contact.phone)}`}
                      label={`${t("visitingCard.call")} ${contact.name}`}
                      variant="phone"
                      simple={simpleBorders}
                    >
                      <Phone className="h-3.5 w-3.5" style={{ color: GOLD }} aria-hidden="true" />
                    </ContactActionLink>
                    <ContactActionLink
                      href={`https://wa.me/${phoneWhatsApp(contact.phone)}`}
                      label={`WhatsApp ${contact.name}`}
                      variant="whatsapp"
                      simple={simpleBorders}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" aria-hidden="true" />
                    </ContactActionLink>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex items-start justify-between gap-2 px-4 py-3 sm:gap-3"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold leading-tight sm:text-base" style={{ color: GOLD }}>
                {VISITING_CARD_BUSINESS_NAME}
              </p>
              <p className="mt-1 text-[10px] leading-snug sm:text-[11px]" style={{ color: BROWN }}>
                {VISITING_CARD_ADDRESS}
              </p>
            </div>
            <img
              src={VISITING_CARD_LOGO}
              alt={VISITING_CARD_BUSINESS_NAME}
              className="h-auto w-14 shrink-0 object-contain sm:w-20"
              crossOrigin="anonymous"
            />
          </div>

          <div
            className="border-t px-4 py-2.5"
            style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
          >
            <p className="text-[10px] leading-snug sm:text-[12px]" style={{ color: BROWN }}>
              <span className="font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                {t("visitingCard.contactsLabel")}:
              </span>{" "}
              {VISITING_CARD_CONTACTS.map((contact, i) => (
                <span key={contact.phone}>
                  {i > 0 ? " · " : ""}
                  <span className="font-semibold">{contact.name}</span>{" "}
                  <span className="tabular-nums">{contact.phone}</span>
                </span>
              ))}
            </p>
          </div>
        </>
      )}
    </header>
  );
};
