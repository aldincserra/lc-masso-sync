import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Calendar, Users, CreditCard, Package } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/pagamentos", icon: CreditCard, label: "Caixa" },
  { to: "/pacotes", icon: Package, label: "Pacotes" },
];

export function MobileNav() {
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
      </div>
    </nav>
  );
}
