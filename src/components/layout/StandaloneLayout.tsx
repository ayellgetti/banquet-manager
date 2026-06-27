import { Outlet } from "react-router-dom";

/** Full-page layout without admin sidebar, header, or navigation chrome. */
export const StandaloneLayout = () => (
  <div className="min-h-screen bg-background">
    <Outlet />
  </div>
);
