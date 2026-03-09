import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import MapaTTC from "./pages/MapaTTC";
import AlertasPage from "./pages/AlertasPage";
import SeriesTemporaisPage from "./pages/SeriesTemporaisPage";
import SRGanPage from "./pages/SRGanPage";
import OrdensServicoPage from "./pages/OrdensServicoPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<MapaTTC />} />
            <Route path="/alertas" element={<AlertasPage />} />
            <Route path="/vegetacao" element={<PlaceholderPage title="Análise de Vegetação" />} />
            <Route path="/series-temporais" element={<SeriesTemporaisPage />} />
            <Route path="/sr-gan" element={<SRGanPage />} />
            <Route path="/insar" element={<PlaceholderPage title="Pipeline InSAR" />} />
            <Route path="/ordens-servico" element={<OrdensServicoPage />} />
            <Route path="/relatorios" element={<PlaceholderPage title="Relatórios" />} />
            <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
