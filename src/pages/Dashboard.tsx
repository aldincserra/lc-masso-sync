import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Package, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Clientes",
    value: "24",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Sessões Hoje",
    value: "5",
    icon: Calendar,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Receita Mensal",
    value: "R$ 4.850",
    icon: DollarSign,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    title: "Pacotes Ativos",
    value: "12",
    icon: Package,
    color: "text-accent-foreground",
    bg: "bg-accent",
  },
];

const proximasSessoes = [
  { hora: "09:00", cliente: "Maria Silva", servico: "Massagem Relaxante" },
  { hora: "10:30", cliente: "João Santos", servico: "Massagem Terapêutica" },
  { hora: "14:00", cliente: "Ana Oliveira", servico: "Drenagem Linfática" },
];

const pagamentosPendentes = [
  { cliente: "Marta Souza", valor: 120.0 },
  { cliente: "Carlos Lima", valor: 200.0 },
];

export default function Dashboard() {
  const hoje = new Date();
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Olá, Laís!
          </h1>
          <p className="text-muted-foreground">
            {hoje.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button variant="brand" asChild>
          <Link to="/agenda">
            <Plus className="h-4 w-4" />
            Nova Sessão
          </Link>
        </Button>
      </div>

      {/* Stats */}
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximas Sessões */}
        <Card className="lg:col-span-2 shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">Próximas Sessões</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/agenda" className="text-primary">
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasSessoes.map((sessao, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[50px]">
                    <p className="text-lg font-bold text-primary">{sessao.hora}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sessao.cliente}</p>
                    <p className="text-sm text-muted-foreground">{sessao.servico}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pagamentos Pendentes */}
        <Card className="shadow-brand-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagamentosPendentes.map((pag, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-warning/10 border border-warning/20"
              >
                <p className="text-2xl font-bold text-warning">
                  R$ {pag.valor.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {pag.cliente}
                </p>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/pagamentos">Ver todos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mini Calendar */}
      <Card className="shadow-brand-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">
            {hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-xs font-medium text-muted-foreground py-2">
                {dia}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const diaDoMes = i - new Date(hoje.getFullYear(), hoje.getMonth(), 1).getDay() + 1;
              const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
              const isCurrentMonth = diaDoMes > 0 && diaDoMes <= diasNoMes;
              const isToday = diaDoMes === hoje.getDate();

              return (
                <div
                  key={i}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-muted cursor-pointer"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {isCurrentMonth ? diaDoMes : ""}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
