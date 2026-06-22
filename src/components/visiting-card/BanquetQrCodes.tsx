import { VISITING_CARD_QR_CODES } from "@/data/visitingCard";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { BORDER_SIMPLE, BOX_BORDER, BROWN, CARD_FONT, GOLD } from "./cardTheme";

type BanquetQrCodesProps = {
  /** mini — compact strip beside logo; panel — sidebar beside contacts */
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
      className={cn(isMini ? "text-center" : "text-center", className)}
      style={{ fontFamily: CARD_FONT }}
      data-banquet-qr-codes
    >
      {showTitle ? (
        <p
          className={cn(
            "font-bold uppercase tracking-[0.15em]",
            isMini ? "mb-1 text-[8px]" : "mb-1.5 text-[9px]",
          )}
          style={{ color: GOLD }}
        >
          {t("visitingCard.qrScanLabel")}
        </p>
      ) : null}
      <div
        className={cn(
          isMini ? "flex items-start justify-center gap-1.5" : "grid grid-cols-3 gap-2",
        )}
      >
        {VISITING_CARD_QR_CODES.map((qr) => (
          <a
            key={qr.id}
            href={qr.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-0.5"
            aria-label={t(qr.labelKey)}
          >
            <div
              className={cn(
                "overflow-hidden rounded bg-white p-0.5 transition group-hover:opacity-90",
                isMini ? "h-11 w-11 sm:h-12 sm:w-12" : "h-14 w-14 sm:h-16 sm:w-16",
              )}
              style={{ border: simpleBorder ? BORDER_SIMPLE : BOX_BORDER }}
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
                "max-w-[3.25rem] truncate leading-tight",
                isMini ? "text-[7px] sm:text-[8px]" : "text-[8px] sm:text-[9px]",
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
