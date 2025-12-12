import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  Package,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/pagamentos", icon: CreditCard, label: "Pagamentos" },
  { to: "/pacotes", icon: Package, label: "Pacotes" },
  { to: "/recibos", icon: Receipt, label: "Recibos" },
];

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

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
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
        <Logo size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-brand-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Configurações
        </NavLink>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
