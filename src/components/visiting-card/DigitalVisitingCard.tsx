import { useState } from "react";
import { MapPin, Phone, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  VISITING_CARD_ADDRESS,
  VISITING_CARD_BUSINESS_NAME,
  VISITING_CARD_CONTACTS,
  VISITING_CARD_LOGO,
  phoneTel,
  phoneWhatsApp,
  visitingCardMapsUrl,
} from "@/data/visitingCard";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { useT } from "@/i18n";
import { toast } from "sonner";

const GOLD = "#b8934a";
const GOLD_LIGHT = "#d4b06a";
const BROWN = "#4a3728";
const CREAM = "#faf8f5";
const BORDER_GOLD = `2px solid ${GOLD}`;
const BOX_BORDER = `1px solid ${GOLD_LIGHT}`;

const GoldDivider = () => (
  <svg viewBox="0 0 320 24" className="mx-auto h-5 w-full max-w-[280px]" aria-hidden="true">
    <path
      d="M0 12 H120 Q160 12 160 12 Q200 12 240 12 H320"
      fill="none"
      stroke={GOLD}
      strokeWidth="1"
    />
    <path
      d="M150 4 L160 12 L170 4 M155 20 L160 12 L165 20"
      fill="none"
      stroke={GOLD}
      strokeWidth="1"
    />
  </svg>
);

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
    <div className="mx-auto max-w-lg space-y-6">
      <div
        id="visiting-card-print-area"
        className="overflow-hidden bg-white shadow-soft"
        style={{
          border: BORDER_GOLD,
          boxSizing: "border-box",
          backgroundColor: CREAM,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Logo header — print-safe */}
        <div className="px-8 pb-2 pt-8 text-center" style={{ backgroundColor: "#ffffff" }}>
          <img
            src={VISITING_CARD_LOGO}
            alt={VISITING_CARD_BUSINESS_NAME}
            className="mx-auto h-auto w-full max-w-[300px] object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="px-8 pb-2">
          <GoldDivider />
        </div>

        {/* Body */}
        <div className="space-y-5 px-8 pb-6 pt-2">
          <div className="text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: GOLD }}
            >
              {t("visitingCard.addressLabel")}
            </p>
            <p
              className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed"
              style={{ color: BROWN }}
            >
              {VISITING_CARD_ADDRESS}
            </p>
          </div>

          <GoldDivider />

          <div>
            <p
              className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: GOLD }}
            >
              {t("visitingCard.contactsLabel")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {VISITING_CARD_CONTACTS.map((contact) => (
                <div
                  key={contact.phone}
                  className="rounded-lg px-4 py-3 text-center"
                  style={{ border: BOX_BORDER, backgroundColor: "#ffffff" }}
                  data-vcard-box
                >
                  <p className="text-[15px] font-semibold" style={{ color: BROWN }}>
                    {contact.name}
                  </p>
                  <p
                    className="mt-1.5 flex items-center justify-center gap-1.5 text-[14px] tabular-nums"
                    style={{ color: BROWN }}
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                    <span>{contact.phone}</span>
                  </p>
                  <div className="no-print mt-3 flex flex-wrap justify-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      style={{ borderColor: GOLD_LIGHT, color: BROWN }}
                    >
                      <a href={`tel:${phoneTel(contact.phone)}`}>
                        <Phone className="h-3.5 w-3.5" />
                        {t("visitingCard.call")}
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                    >
                      <a
                        href={`https://wa.me/${phoneWhatsApp(contact.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-8 py-5 text-center"
          style={{ borderTop: BOX_BORDER, backgroundColor: "#ffffff" }}
        >
          <GoldDivider />
          <p className="mt-3 text-[12px] italic" style={{ color: BROWN }}>
            {t("visitingCard.footer")}
          </p>
          <p
            className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em]"
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
