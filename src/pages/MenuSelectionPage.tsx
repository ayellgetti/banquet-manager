import { Navigate, useSearchParams } from "react-router-dom";

/** Legacy route — booking menu selection now lives inside the booking card. */
const MenuSelectionPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const eventId = searchParams.get("eventId");

  if (bookingId) {
    return <Navigate to={`/bookings?focusBooking=${bookingId}`} replace />;
  }

  if (eventId) {
    return <Navigate to="/bookings" replace />;
  }

  return <Navigate to="/bookings" replace />;
};

export default MenuSelectionPage;
