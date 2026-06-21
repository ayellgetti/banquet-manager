import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home.tsx";
import EnquiryPage from "./pages/EnquiryPage.tsx";
import EnquiryPageV2 from "./pages/EnquiryPageV2.tsx";
import MenuSelectionPage from "./pages/MenuSelectionPage.tsx";
import BillPage from "./pages/BillPage.tsx";
import VisitingCardPage from "./pages/VisitingCardPage.tsx";
import ProcurementPage from "./pages/ProcurementPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { LanguageProvider } from "@/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/enquiry" element={<EnquiryPage />} />
            <Route path="/enquiry-v2" element={<EnquiryPageV2 />} />
            <Route path="/menu-selection" element={<MenuSelectionPage />} />
            <Route path="/bill" element={<BillPage />} />
            <Route path="/visiting-card" element={<VisitingCardPage />} />
            <Route path="/procurement" element={<ProcurementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
