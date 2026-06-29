import { useState } from "react";
import { MapPin, Phone, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BanquetQrCodes } from "@/components/visiting-card/BanquetQrCodes";
import { GoldDivider } from "@/components/visiting-card/GoldDivider";
import {
  BORDER_GOLD,
  BOX_BORDER,
  BROWN,
  CARD_FONT,
  GOLD,
  GOLD_LIGHT,
} from "@/components/visiting-card/cardTheme";
import {
  VISITING_CARD_ADDRESS,
  VISITING_CARD_BUSINESS_NAME,
  VISITING_CARD_CONTACTS,
  VISITING_CARD_LOGO,
  VISITING_CARD_QR_CODES,
  visitingCardMapsUrl,
} from "@/data/visitingCard";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { useT } from "@/i18n";
import { toast } from "sonner";

export const DigitalVisitingCard = () => {
  const { t } = useT();
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const shareText = [
    VISITING_CARD_BUSINESS_NAME,
    "",
    t("visitingCard.addressLabel"),
    VISITING_CARD_ADDRESS,
    "",
    t("visitingCard.mapsLabel"),
    visitingCardMapsUrl(),
    "",
    ...VISITING_CARD_CONTACTS.flatMap((c) => [`${c.name}: ${c.phone}`]),
    "",
    t("visitingCard.qrScanLabel"),
    ...VISITING_CARD_QR_CODES.map((qr) => `${t(qr.labelKey)}: ${qr.href}`),
  ].join("\n");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${VISITING_CARD_BUSINESS_NAME} — ${t("module.visitingCard.title")}`,
          text: shareText,
          url: visitingCardMapsUrl(),
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(t("visitingCard.copied"));
    } catch {
      toast.error(t("visitingCard.copyFailed"));
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("visiting-card-print-area");
    if (!element) return;

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(
        element,
        `${VISITING_CARD_BUSINESS_NAME.replace(/\s+/g, "_")}_Visiting_Card.pdf`,
      );
      toast.dismiss(loadingToast);
      if (result === "view") {
        toast.info(t("toast.pdfOpenedMobile"), { duration: 8000 });
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error(t("toast.pdfFailed"));
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div
        id="visiting-card-print-area"
        className="overflow-hidden rounded-lg shadow-soft"
        style={{
          border: BORDER_GOLD,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          fontFamily: CARD_FONT,
        }}
      >
        <div className="px-6 pb-4 pt-8 text-center" style={{ backgroundColor: "#ffffff" }}>
          <img
            src={VISITING_CARD_LOGO}
            alt={VISITING_CARD_BUSINESS_NAME}
            className="mx-auto h-auto w-full max-w-[260px] object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="px-8 py-2" style={{ backgroundColor: "#ffffff" }}>
          <GoldDivider />
        </div>

        <div
          className="border-t px-6 pb-5 pt-3"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <p
            className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: GOLD }}
          >
            {t("visitingCard.contactsLabel")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {VISITING_CARD_CONTACTS.map((contact) => (
              <div
                key={contact.phone}
                className="rounded-lg px-4 py-3.5 text-center"
                style={{ border: BOX_BORDER, backgroundColor: "#ffffff" }}
                data-vcard-box
              >
                <p className="text-[14px] font-semibold sm:text-[15px]" style={{ color: BROWN }}>
                  {contact.name}
                </p>
                <p
                  className="mt-1.5 flex items-center justify-center gap-1.5 text-[14px] font-bold tabular-nums tracking-wide sm:text-[15px]"
                  style={{ color: BROWN }}
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  <span>{contact.phone}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="border-t px-6 py-5"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <BanquetQrCodes variant="panel" />
        </div>

        <div
          className="border-t px-6 py-5 text-center"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <GoldDivider />
          <p className="mx-auto mt-3 max-w-xs text-[12px] italic leading-relaxed" style={{ color: BROWN }}>
            {t("visitingCard.footer")}
          </p>
          <p
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            {VISITING_CARD_BUSINESS_NAME}
          </p>
        </div>

        <div
          className="border-t px-6 py-4"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <p
            className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: GOLD }}
          >
            {t("visitingCard.addressLabel")}
          </p>
          <a
            href={visitingCardMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto block max-w-sm text-center no-underline"
          >
            <MapPin
              className="mx-auto mb-2 h-4 w-4 transition group-hover:scale-110"
              style={{ color: GOLD }}
              aria-hidden="true"
            />
            <p
              className="text-[12px] leading-relaxed transition group-hover:underline sm:text-[13px]"
              style={{ color: BROWN }}
            >
              {VISITING_CARD_ADDRESS}
            </p>
          </a>
        </div>
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline" className="gap-2">
          <a href={visitingCardMapsUrl()} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4" />
            {t("visitingCard.openMaps")}
          </a>
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => void handleShare()}>
          <Share2 className="h-4 w-4" />
          {t("visitingCard.share")}
        </Button>
        <Button
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          onClick={() => void handleDownloadPdf()}
          disabled={isPdfGenerating}
        >
          <Printer className="h-4 w-4" />
          {isPdfGenerating ? t("toast.pdfGenerating") : t("visitingCard.downloadPdf")}
        </Button>
      </div>
    </div>
  );
};
