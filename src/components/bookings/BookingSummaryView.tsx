import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnquirySummaryFooter, EnquirySummaryPanel } from "@/components/enquiry/EnquirySummaryPanel";
import type { BookingRecord } from "@/data/banquetData";
import { useBookingsQuery } from "@/hooks/useBanquetData";
import {
  buildBookingPdfFilename,
  mapBookingToEnquiryState,
} from "@/lib/bookingSummaryMapper";
import { downloadPdfFromElement } from "@/lib/downloadPdf";
import { fetchEventByIdFromApi } from "@/lib/eventsApi";
import { openEnquiryWhatsApp, WHATSAPP_NUMBER } from "@/lib/whatsappEnquiry";
import type { EnquiryState } from "@/types/enquiry";
import { useT } from "@/i18n";
import { toast } from "sonner";

const PRINT_AREA_ID = "print-area-booking-summary";

type Props = {
  bookingId: string;
};

export const BookingSummaryView = ({ bookingId }: Props) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { data: bookings, isLoading: bookingsLoading } = useBookingsQuery();
  const [state, setState] = useState<EnquiryState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);

  const booking = bookings?.find((item) => item.id === bookingId) ?? null;

  useEffect(() => {
    if (bookingsLoading || !booking) return;
    if (!booking.eventId) {
      setLoadError(true);
      return;
    }

    let cancelled = false;
    setIsLoadingEvent(true);
    setLoadError(false);

    void fetchEventByIdFromApi(booking.eventId)
      .then((event) => {
        if (cancelled) return;
        setState(mapBookingToEnquiryState(booking, event));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEvent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [booking, bookingsLoading]);

  const updateState = <K extends keyof EnquiryState>(key: K, value: EnquiryState[K]) =>
    setState((current) => (current ? { ...current, [key]: value } : current));

  const goBack = () => {
    navigate(`/bookings?focusBooking=${bookingId}`);
  };

  const handleDownloadPdf = async () => {
    if (!state || !booking) return;
    const element = document.getElementById(PRINT_AREA_ID);
    if (!element) {
      toast.error(t("toast.pdfFailed"));
      return;
    }

    setIsPdfGenerating(true);
    const loadingToast = toast.loading(t("toast.pdfGenerating"));
    try {
      const result = await downloadPdfFromElement(element, buildBookingPdfFilename(booking));
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

  const handleWhatsApp = () => {
    if (!state) return;
    if (!WHATSAPP_NUMBER) {
      toast.error(t("toast.whatsappNoNumber"));
      return;
    }

    setIsWhatsAppLoading(true);
    try {
      openEnquiryWhatsApp(state);
    } finally {
      setIsWhatsAppLoading(false);
    }
  };

  if (bookingsLoading || isLoadingEvent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("bookings.summaryLoading")}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("bookings.summaryNotFound")}
      </div>
    );
  }

  if (loadError || !state) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {!booking.eventId ? t("bookings.summaryNoEvent") : t("bookings.summaryLoadError")}
        </div>
        <button
          type="button"
          onClick={goBack}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("bookings.backToBookings")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("bookings.summaryTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("bookings.summaryDesc").replace("{title}", booking.title || booking.clientName)}
        </p>
      </div>

      <Tabs value="summary">
        <div className="no-print -mx-1 overflow-x-auto sm:mx-0">
          <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-soft sm:w-full">
            <TabsTrigger
              value="summary"
              className="group shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold sm:flex-1 sm:text-sm"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                1
              </span>
              {t("tab.summary")}
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <EnquirySummaryPanel
        state={state}
        onUpdateState={updateState}
        printAreaId={PRINT_AREA_ID}
      />

      <EnquirySummaryFooter
        state={state}
        onBack={goBack}
        onDownloadPdf={() => void handleDownloadPdf()}
        onWhatsApp={handleWhatsApp}
        isPdfGenerating={isPdfGenerating}
        isWhatsAppLoading={isWhatsAppLoading}
      />
    </div>
  );
};
