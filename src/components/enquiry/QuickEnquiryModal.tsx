import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuickEnquiryForm } from "@/components/enquiry/QuickEnquiryForm";
import type { EnquiryRecord } from "@/data/banquetData";
import { useT } from "@/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  enquiry?: EnquiryRecord | null;
};

export const QuickEnquiryModal = ({ open, onOpenChange, defaultDate, enquiry }: Props) => {
  const { t } = useT();
  const isEdit = Boolean(enquiry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {isEdit ? t("enquiries.edit") : t("enquiryV2.title")}
            {!isEdit && (
              <span aria-hidden="true" className="ml-0.5 text-destructive">
                *
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEdit ? t("enquiryV2.editDesc") : t("enquiryV2.desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <QuickEnquiryForm
            key={enquiry?.id ?? "create"}
            enquiry={enquiry}
            defaultDate={defaultDate}
            onCancel={() => onOpenChange(false)}
            onSubmitted={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
