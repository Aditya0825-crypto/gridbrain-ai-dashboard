import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Overview from "./pages/Overview";
import Demand from "./pages/Demand";
import Risk from "./pages/Risk";
import Infrastructure from "./pages/Infrastructure";
import Simulation from "./pages/Simulation";
import Settings from "./pages/Settings";
import ExplainableAI from "./pages/ExplainableAI";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Government from "./pages/Government";
import Users from "./pages/Users";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound.tsx";
import { LanguageProvider } from "./i18n/LanguageProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/demand" element={<Demand />} />
              <Route path="/risk" element={<Risk />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/explainable-ai" element={<ExplainableAI />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/government" element={<Government />} />
              <Route path="/users" element={<Users />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
