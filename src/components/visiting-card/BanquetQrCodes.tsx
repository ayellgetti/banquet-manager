import { VISITING_CARD_QR_CODES } from "@/data/visitingCard";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { BORDER_SIMPLE, BOX_BORDER, BROWN, CARD_FONT, GOLD } from "./cardTheme";

type BanquetQrCodesProps = {
  /** mini — compact strip; panel — full-width grid for visiting card */
  variant?: "mini" | "panel";
  simpleBorder?: boolean;
  showTitle?: boolean;
  className?: string;
};

export const BanquetQrCodes = ({
  variant = "panel",
  simpleBorder = false,
  showTitle = true,
  className,
}: BanquetQrCodesProps) => {
  const { t } = useT();
  const isMini = variant === "mini";

  return (
    <div
      className={cn("text-center", className)}
      style={{ fontFamily: CARD_FONT }}
      data-banquet-qr-codes
    >
      {showTitle ? (
        <p
          className={cn(
            "font-bold uppercase tracking-[0.18em]",
            isMini ? "mb-1 text-[8px]" : "mb-3 text-[10px]",
          )}
          style={{ color: GOLD }}
        >
          {t("visitingCard.qrScanLabel")}
        </p>
      ) : null}
      <div
        className={cn(
          isMini ? "flex items-start justify-center gap-2" : "mx-auto grid max-w-xs grid-cols-3 gap-3",
        )}
      >
        {VISITING_CARD_QR_CODES.map((qr) => (
          <a
            key={qr.id}
            href={qr.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1"
            aria-label={t(qr.labelKey)}
          >
            <div
              className={cn(
                "overflow-hidden rounded-md bg-white p-1 transition group-hover:opacity-90",
                isMini ? "h-11 w-11 sm:h-12 sm:w-12" : "aspect-square w-full max-w-[5.5rem]",
              )}
              style={{ border: simpleBorder ? BORDER_SIMPLE : BOX_BORDER }}
              data-vcard-box
            >
              <img
                src={qr.image}
                alt={t(qr.labelKey)}
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <span
              className={cn(
                "max-w-[4.5rem] truncate font-medium leading-tight",
                isMini ? "text-[7px] sm:text-[8px]" : "text-[9px] sm:text-[10px]",
              )}
              style={{ color: BROWN }}
            >
              {t(qr.labelKey)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
