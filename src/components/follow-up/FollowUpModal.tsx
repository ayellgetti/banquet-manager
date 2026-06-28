import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FollowUpDetailPanel } from "@/components/follow-up/FollowUpDetailPanel";
import { FollowUpEnquiryPickerList } from "@/components/follow-up/FollowUpEnquiryPickerList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type FollowUpEnquiryRecord } from "@/data/banquetData";
import { useT } from "@/i18n";

type Step = "pick" | "detail";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiries: FollowUpEnquiryRecord[];
  enquiry: FollowUpEnquiryRecord | null;
};

export const FollowUpModal = ({ open, onOpenChange, enquiries, enquiry: initialEnquiry }: Props) => {
  const { t } = useT();
  const [step, setStep] = useState<Step>(initialEnquiry ? "detail" : "pick");
  const [selectedEnquiry, setSelectedEnquiry] = useState<FollowUpEnquiryRecord | null>(initialEnquiry);

  useEffect(() => {
    if (!open) {
      setStep(initialEnquiry ? "detail" : "pick");
      setSelectedEnquiry(initialEnquiry);
      return;
    }

    if (initialEnquiry) {
      setSelectedEnquiry(initialEnquiry);
      setStep("detail");
    } else {
      setSelectedEnquiry(null);
      setStep("pick");
    }
  }, [open, initialEnquiry]);

  const handleSelectEnquiry = (enquiry: FollowUpEnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setStep("detail");
  };

  const handleBack = () => {
    if (initialEnquiry) {
      onOpenChange(false);
      return;
    }
    setStep("pick");
    setSelectedEnquiry(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {step === "pick" ? t("followUp.enquiryList") : t("followUp.modalTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === "pick"
              ? t("followUp.selectHint")
              : selectedEnquiry
                ? `${selectedEnquiry.clientName} · ${selectedEnquiry.eventType}`
                : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === "pick" && (
            <FollowUpEnquiryPickerList enquiries={enquiries} onSelect={handleSelectEnquiry} />
          )}

          {step === "detail" && selectedEnquiry && (
            <div className="space-y-4">
              {!initialEnquiry && (
                <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-0" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                  {t("bookings.backToEnquiries")}
                </Button>
              )}

              <FollowUpDetailPanel
                key={selectedEnquiry.id}
                enquiry={selectedEnquiry}
                compact
                onSaved={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
