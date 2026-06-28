import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { CalendarDayEventCard } from "@/components/calendar/CalendarDayEventCard";
import { QuickBookingModal } from "@/components/bookings/QuickBookingModal";
import { QuickEnquiryModal } from "@/components/enquiry/QuickEnquiryModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventsForDate, type CalendarEvent } from "@/data/calendarEvents";
import { useT } from "@/i18n";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
  events?: CalendarEvent[];
};

export const CalendarDayModal = ({ open, onOpenChange, date, events }: Props) => {
  const { t } = useT();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const dayEvents = date ? getEventsForDate(date, events) : [];
  const dateParam = date ? format(date, "yyyy-MM-dd") : "";
  const eventCount = dayEvents.length;

  const eventCountLabel =
    eventCount === 1
      ? t("calendar.modal.eventCountOne")
      : t("calendar.modal.eventCountMany").replace("{count}", String(eventCount));

  const handleLogEnquiry = () => {
    onOpenChange(false);
    setEnquiryOpen(true);
  };

  const handleNewBooking = () => {
    onOpenChange(false);
    setBookingOpen(true);
  };

  const closeModal = () => onOpenChange(false);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-lg">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="font-display text-xl font-semibold leading-snug sm:text-2xl">
            {date ? format(date, "EEEE, MMMM d, yyyy") : ""}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {eventCount === 0 ? t("calendar.modal.empty") : eventCountLabel}
          </DialogDescription>
        </DialogHeader>

        {eventCount > 0 && (
          <div className="max-h-[min(50vh,20rem)] space-y-3 overflow-y-auto pr-1 scrollbar-subtle">
            {dayEvents.map((event) => (
              <CalendarDayEventCard key={event.id} event={event} dateParam={dateParam} onNavigate={closeModal} />
            ))}
          </div>
        )}

        <DialogFooter className="flex-row gap-3 border-t border-border/60 pt-4 sm:justify-stretch">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleLogEnquiry}>
            <CalendarDays className="h-4 w-4" />
            {t("calendar.modal.logEnquiry")}
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            onClick={handleNewBooking}
          >
            <Plus className="h-4 w-4" />
            {t("calendar.modal.newBooking")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <QuickEnquiryModal open={enquiryOpen} onOpenChange={setEnquiryOpen} defaultDate={dateParam} />
    <QuickBookingModal open={bookingOpen} onOpenChange={setBookingOpen} defaultDate={dateParam} />
  </>
  );
};
