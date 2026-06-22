import { useState } from "react";
import { MapPin, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BanquetHeader } from "@/components/visiting-card/BanquetHeader";
import {
  BORDER_SIMPLE,
  BROWN,
  CARD_FONT,
  CREAM,
  GOLD,
  GOLD_LIGHT,
} from "@/components/visiting-card/cardTheme";
import {
  VISITING_CARD_ADDRESS,
  VISITING_CARD_BUSINESS_NAME,
  VISITING_CARD_CONTACTS,
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
    <div className="mx-auto max-w-md space-y-4">
      <div
        id="visiting-card-print-area"
        className="overflow-hidden rounded-sm"
        style={{
          border: BORDER_SIMPLE,
          boxSizing: "border-box",
          backgroundColor: CREAM,
          fontFamily: CARD_FONT,
        }}
      >
        <BanquetHeader embedded showContactActions />

        <div
          className="border-t px-6 py-4 text-center"
          style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
        >
          <p className="mx-auto max-w-xs text-[12px] italic leading-relaxed" style={{ color: BROWN }}>
            {t("visitingCard.footer")}
          </p>
          <p
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            {VISITING_CARD_BUSINESS_NAME}
          </p>
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
