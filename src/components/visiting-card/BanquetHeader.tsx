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
import { BanquetQrCodes } from "./BanquetQrCodes";
import { BORDER_GOLD, BORDER_SIMPLE, BOX_BORDER, BROWN, CARD_FONT, CREAM, GOLD, GOLD_LIGHT } from "./cardTheme";

type BanquetHeaderProps = {
  className?: string;
  /** Flush inside a parent card — no outer border or corner radius */
  embedded?: boolean;
  /** Structured contact rows with call & WhatsApp actions (visiting card) */
  showContactActions?: boolean;
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
      style={{
        border: embedded ? undefined : BORDER_GOLD,
        backgroundColor: embedded ? undefined : "#ffffff",
        fontFamily: CARD_FONT,
      }}
    >
      <div
        className="flex items-start justify-between gap-2 px-4 py-3 sm:gap-3"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="min-w-0 flex-1 text-left">
          <p
            className={cn(
              "font-bold leading-tight",
              showContactActions ? "text-base sm:text-lg" : "text-sm sm:text-base",
            )}
            style={{ color: GOLD }}
          >
            {VISITING_CARD_BUSINESS_NAME}
          </p>
          <p
            className={cn(
              "mt-1 leading-snug",
              showContactActions ? "text-[11px] sm:text-xs" : "text-[10px] sm:text-[11px]",
            )}
            style={{ color: BROWN }}
          >
            {VISITING_CARD_ADDRESS}
          </p>
        </div>

        {showContactActions ? (
          <BanquetQrCodes
            variant="mini"
            simpleBorder={simpleBorders}
            className="shrink-0 md:hidden"
          />
        ) : null}

        <img
          src={VISITING_CARD_LOGO}
          alt={VISITING_CARD_BUSINESS_NAME}
          className={cn(
            "h-auto shrink-0 object-contain",
            showContactActions ? "w-14 sm:w-16" : "w-14 sm:w-20",
          )}
          crossOrigin="anonymous"
        />
      </div>

      <div
        className="border-t px-4 py-2.5"
        style={{
          borderColor: GOLD_LIGHT,
          borderTopWidth: simpleBorders ? 1 : undefined,
          backgroundColor: showContactActions ? CREAM : "#ffffff",
        }}
      >
        {showContactActions ? (
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
              <div className="min-w-0">
                <p
                  className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: GOLD }}
                >
                  {t("visitingCard.contactsLabel")}
                </p>
                <ul className={cn("grid gap-2", embedded ? "grid-cols-1" : "grid-cols-2")}>
                  {VISITING_CARD_CONTACTS.map((contact) => (
                    <li
                      key={contact.phone}
                      className={cn(
                        "rounded-md border px-2.5 py-2",
                        embedded
                          ? "flex items-center justify-between gap-3"
                          : "flex items-center justify-between gap-1.5",
                      )}
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

              <div
                className="hidden shrink-0 border-t pt-2.5 md:block md:border-l md:border-t-0 md:pl-4 md:pt-0"
                style={{ borderColor: GOLD_LIGHT }}
              >
                <BanquetQrCodes variant="panel" simpleBorder={simpleBorders} />
              </div>
            </div>
        ) : (
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
        )}
      </div>
    </header>
  );
};
