import { useSearchParams } from "react-router-dom";
import { BanquetHeader } from "@/components/visiting-card/BanquetHeader";
import { QuickEnquiryForm } from "@/components/enquiry/QuickEnquiryForm";
import { BORDER_GOLD, BROWN, CARD_FONT, CREAM, GOLD, GOLD_LIGHT } from "@/components/visiting-card/cardTheme";
import { useT } from "@/i18n";

export const EventEnquiryV3 = () => {
  const { t } = useT();
  const [searchParams] = useSearchParams();
  const defaultDate = searchParams.get("date") ?? undefined;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="mx-auto w-full max-w-[210mm] space-y-1.5">
        <BanquetHeader showContactActions compact />

        <section
          className="overflow-hidden rounded-lg bg-white shadow-soft"
          style={{ border: BORDER_GOLD, fontFamily: CARD_FONT }}
        >
          <header
            className="space-y-2 border-b px-5 py-4 sm:px-6 sm:py-5"
            style={{ borderColor: GOLD_LIGHT, backgroundColor: "#ffffff" }}
          >
            <h1 className="text-lg font-bold leading-snug sm:text-xl" style={{ color: GOLD }}>
              {t("enquiryV3.title")}
              <span aria-hidden="true" className="ml-0.5 text-destructive">
                *
              </span>
            </h1>
            <p className="text-sm leading-snug" style={{ color: BROWN }}>
              {t("enquiryV3.desc")}
            </p>
          </header>

          <div className="px-5 py-5 sm:px-6 sm:py-6" style={{ backgroundColor: CREAM }}>
            <QuickEnquiryForm key={defaultDate ?? "create"} defaultDate={defaultDate} />
          </div>
        </section>
      </div>
    </div>
  );
};
