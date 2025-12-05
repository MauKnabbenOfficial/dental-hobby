import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import ProcedureTemplates from "./pages/ProcedureTemplates";
import Treatments from "./pages/Treatments";
import Team from "./pages/Team";
import Financial from "./pages/Financial";
import StageTemplates from "./pages/StageTemplates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/pacientes" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Patients />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/procedimentos" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProcedureTemplates />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/atendimentos" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Treatments />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/equipe" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Team />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Financial />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/etapas" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StageTemplates />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
