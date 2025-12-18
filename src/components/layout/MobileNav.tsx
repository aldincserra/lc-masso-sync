import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Calendar, Users, CreditCard, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/pagamentos", icon: CreditCard, label: "Caixa" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin");
        setIsAdmin(roles && roles.length > 0);
      }
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Sessão encerrada",
        description: "Você foi deslogado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao sair.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <Shield className="h-5 w-5" />
            <span>Admin</span>
          </NavLink>
        )}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-[60px] text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}
