import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import PGList from "./pages/admin/PGList";
import PGDashboard from "./pages/admin/PGDashboard";
import FloorsList from "./pages/admin/FloorsList";
import RoomsList from "./pages/admin/RoomsList";
import RoomDetail from "./pages/admin/RoomDetail";
import ResidentDetail from "./pages/admin/ResidentDetail";
import AllResidents from "./pages/admin/AllResidents";
import GrievancesPage from "./pages/admin/GrievancesPage";
import SeparationRequests from "./pages/admin/SeparationRequests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/resident" element={<ResidentDashboard />} />
            <Route path="/admin" element={<PGList />} />
            <Route path="/admin/:pgId" element={<PGDashboard />} />
            <Route path="/admin/:pgId/floors" element={<FloorsList />} />
            <Route path="/admin/:pgId/floors/:floorId" element={<RoomsList />} />
            <Route path="/admin/:pgId/floors/:floorId/:roomId" element={<RoomDetail />} />
            <Route path="/admin/:pgId/residents" element={<AllResidents />} />
            <Route path="/admin/:pgId/residents/:residentId" element={<ResidentDetail />} />
            <Route path="/admin/:pgId/grievances" element={<GrievancesPage />} />
            <Route path="/admin/:pgId/separations" element={<SeparationRequests />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
