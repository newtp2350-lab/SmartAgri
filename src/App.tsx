import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Weather from "./pages/Weather";
import SoilInsights from "./pages/SoilInsights";
import Market from "./pages/Market";
import MarketTest from "./pages/MarketTest";
import MarketSimple from "./pages/MarketSimple";
import FarmHistory from "./pages/FarmHistory";
import Alerts from "./pages/Alerts";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Layout from "@/components/Layout";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserRow } from "@/integrations/supabase/auth";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure we have a row in users after auth
    ensureUserRow();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      ensureUserRow();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}> 
              <Route path="/" element={<Index />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/soil" element={<SoilInsights />} />
              <Route path="/market" element={<MarketSimple />} />
              <Route path="/history" element={<FarmHistory />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
