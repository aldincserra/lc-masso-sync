import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Agenda from "./pages/Agenda";
import Pagamentos from "./pages/Pagamentos";
import Pacotes from "./pages/Pacotes";
import Recibos from "./pages/Recibos";
import NotFound from "./pages/NotFound";
import Instalar from "./pages/Instalar";
import Admin from "./pages/Admin";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const checkApproval = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('aprovado')
      .eq('id', userId)
      .single();

    if (error || !data?.aprovado) {
      await supabase.auth.signOut();
      setSession(null);
      setIsApproved(false);
      return;
    }
    setIsApproved(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          setTimeout(() => checkApproval(currentSession.user.id), 0);
        } else {
          setIsApproved(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkApproval(currentSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!session || isApproved === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="pagamentos" element={<Pagamentos />} />
            <Route path="pacotes" element={<Pacotes />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
          <Route path="/instalar" element={<Instalar />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
