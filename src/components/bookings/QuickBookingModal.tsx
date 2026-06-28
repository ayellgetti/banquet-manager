import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { EnquiryPickerList } from "@/components/bookings/EnquiryPickerList";
import { QuickBookingForm } from "@/components/bookings/QuickBookingForm";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCustomerForLog, type EnquiryRecord } from "@/data/banquetData";
import { useOpenEnquiriesQuery } from "@/hooks/useBanquetData";
import { useT } from "@/i18n";

type Step = "pick" | "form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  initialEnquiryId?: string;
};

export const QuickBookingModal = ({ open, onOpenChange, defaultDate, initialEnquiryId }: Props) => {
  const { t } = useT();
  const { data: openEnquiries, isLoading } = useOpenEnquiriesQuery(open);
  const [step, setStep] = useState<Step>(initialEnquiryId ? "form" : "pick");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(initialEnquiryId ? "form" : "pick");
      setSelectedEnquiry(null);
      return;
    }

    if (initialEnquiryId && openEnquiries) {
      const match = openEnquiries.find((e) => e.id === initialEnquiryId);
      if (match) {
        setSelectedEnquiry(match);
        setStep("form");
      }
    }
  }, [open, initialEnquiryId, openEnquiries]);

  const handleSelectEnquiry = (enquiry: EnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setStep("form");
  };

  const handleBack = () => {
    if (initialEnquiryId) {
      onOpenChange(false);
      return;
    }
    setStep("pick");
    setSelectedEnquiry(null);
  };

  const customerName = selectedEnquiry ? getCustomerForLog(selectedEnquiry.customerId).name : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {step === "pick" ? t("bookings.selectEnquiry") : t("bookings.convertTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === "pick" ? t("bookings.selectEnquiryDesc") : t("bookings.form.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === "pick" && (
            <>
              {isLoading && <DataLoadingState label={t("enquiries.loading")} />}
              {openEnquiries && (
                <EnquiryPickerList enquiries={openEnquiries} onSelect={handleSelectEnquiry} />
              )}
            </>
          )}

          {step === "form" && selectedEnquiry && (
            <div className="space-y-4">
              {!initialEnquiryId && (
                <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-0" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                  {t("bookings.backToEnquiries")}
                </Button>
              )}

              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("bookings.convertingEnquiry")}
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {customerName} — {selectedEnquiry.eventType}
                </p>
                <p className="text-sm text-muted-foreground">{selectedEnquiry.preferredDate}</p>
              </div>

              <QuickBookingForm
                enquiry={selectedEnquiry}
                defaultDate={defaultDate ?? selectedEnquiry.preferredDate}
                defaultTitle={`${customerName} — ${selectedEnquiry.eventType}`}
                onCancel={() => onOpenChange(false)}
                onSubmitted={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
