import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  totalClientes: number;
  sessoesHoje: number;
  receitaMensal: number;
  sessoesRealizadasMes: number;
  loading: boolean;
}

export function StatsCards({
  totalClientes,
  sessoesHoje,
  receitaMensal,
  sessoesRealizadasMes,
  loading,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Clientes",
      value: loading ? "..." : totalClientes.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Sessões Hoje",
      value: loading ? "..." : sessoesHoje.toString(),
      icon: Calendar,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Receita Mensal",
      value: loading ? "..." : `R$ ${receitaMensal.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Sessões no Mês",
      value: loading ? "..." : sessoesRealizadasMes.toString(),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="gradient-card border-0 shadow-brand-sm hover:shadow-brand-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
