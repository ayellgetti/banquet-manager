import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { BookingRecord } from "@/data/banquetData";
import { useT } from "@/i18n";
import { toast } from "sonner";

type Props = {
  booking: BookingRecord;
  className?: string;
  size?: "default" | "sm" | "icon";
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
};

export const BookingSummaryPdfButton = ({
  booking,
  className,
  size = "sm",
  variant = "outline",
  showLabel = true,
}: Props) => {
  const { t } = useT();
  const navigate = useNavigate();

  const handleOpenSummary = () => {
    if (!booking.eventId) {
      toast.error(t("bookings.summaryNoEvent"));
      return;
    }
    navigate(`/bookings/summary?bookingId=${encodeURIComponent(booking.id)}`);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={showLabel ? `gap-2 ${className ?? ""}` : className}
      aria-label={t("bookings.viewSummary")}
      onClick={handleOpenSummary}
    >
      <Printer className="h-4 w-4" />
      {showLabel && t("bookings.viewSummary")}
    </Button>
  );
};
