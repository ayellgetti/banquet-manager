import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuickEnquiryForm } from "@/components/enquiry/QuickEnquiryForm";
import { useT } from "@/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
};

export const QuickEnquiryModal = ({ open, onOpenChange, defaultDate }: Props) => {
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl scrollbar-subtle">
        <DialogHeader className="space-y-2 border-b border-border/60 px-6 py-5 pr-12 text-left">
          <DialogTitle className="font-display text-lg font-semibold leading-snug">
            {t("enquiryV2.title")}
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("enquiryV2.desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <QuickEnquiryForm
            defaultDate={defaultDate}
            onCancel={() => onOpenChange(false)}
            onSubmitted={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
