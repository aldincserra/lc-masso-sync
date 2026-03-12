import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      setIsAdmin(!!(data && data.length > 0));
    };
    check();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
