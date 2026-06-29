import { Navigate, useSearchParams } from "react-router-dom";
import { BookingSummaryView } from "@/components/bookings/BookingSummaryView";

const BookingSummaryPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return <Navigate to="/bookings" replace />;
  }

  return <BookingSummaryView bookingId={bookingId} />;
};

export default BookingSummaryPage;
