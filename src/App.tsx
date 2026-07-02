import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthAwareLayout } from "@/components/layout/AuthAwareLayout";
import { AuthProvider } from "@/context/AuthContext";
import EnquiryPage from "./pages/EnquiryPage.tsx";
import EnquiryPageV2 from "./pages/EnquiryPageV2.tsx";
import EnquiryPageV3 from "./pages/EnquiryPageV3.tsx";
import MenuSelectionPage from "./pages/MenuSelectionPage.tsx";
import BillPage from "./pages/BillPage.tsx";
import GenerateInvoicePage from "./pages/GenerateInvoicePage.tsx";
import VisitingCardPage from "./pages/VisitingCardPage.tsx";
import MenuPackageCardPage from "./pages/MenuPackageCardPage.tsx";
import MenuCatalogPage from "./pages/MenuCatalogPage.tsx";
import MenuPackagesDisplayPage from "./pages/MenuPackagesDisplayPage.tsx";
import ProcurementPage from "./pages/ProcurementPage.tsx";
import ExtraPage from "./pages/ExtraPage.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";
import EnquiriesPage from "./pages/EnquiriesPage.tsx";
import BookingSummaryPage from "./pages/BookingSummaryPage.tsx";
import BookingsPage from "./pages/BookingsPage.tsx";
import CustomersPage from "./pages/CustomersPage.tsx";
import FollowUpPage from "./pages/FollowUpPage.tsx";
import PaymentsPage from "./pages/PaymentsPage.tsx";
import VendorsPage from "./pages/VendorsPage.tsx";
import InventoryPage from "./pages/InventoryPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { LanguageProvider } from "@/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<AuthAwareLayout />}>
                <Route path="/enquiry-v3" element={<EnquiryPageV3 />} />
                <Route path="/menu-package-card" element={<MenuPackageCardPage />} />
                <Route path="/menu-packages" element={<MenuPackagesDisplayPage />} />
                <Route path="/menu-catalog" element={<MenuCatalogPage />} />
                <Route path="/visiting-card" element={<VisitingCardPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/" element={<Navigate to="/calendar" replace />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/enquiries" element={<EnquiriesPage />} />
                  <Route path="/follow-up" element={<FollowUpPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/bookings/summary" element={<BookingSummaryPage />} />
                  <Route path="/vendors" element={<VendorsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/generate-invoice" element={<GenerateInvoicePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/extra" element={<ExtraPage />} />
                  <Route path="/enquiry" element={<EnquiryPage />} />
                  <Route path="/enquiry-v2" element={<EnquiryPageV2 />} />
                  <Route path="/menu-selection" element={<MenuSelectionPage />} />
                  <Route path="/bill" element={<BillPage />} />
                  <Route path="/procurement" element={<ProcurementPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
