import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/layout/AdminLayout";

/** Uses admin chrome when signed in; otherwise a minimal full-page layout. */
export const AuthAwareLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AdminLayout />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
};
