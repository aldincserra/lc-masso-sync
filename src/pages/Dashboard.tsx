import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, Package, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientes } from "@/hooks/useClientes";
import { useSessoes } from "@/hooks/useSessoes";

const servicosDisponiveis = [
  "Massagem Relaxante",
  "Massagem Terapêutica",
  "Drenagem Linfática",
  "Massagem Desportiva",
  "Reflexologia",
  "Quick Massage",
];

export default function Dashboard() {
  const { clientes, loading: loadingClientes } = useClientes();
  const { sessoes, loading: loadingSessoes, getProximasSessoes } = useSessoes();
  
  const hoje = new Date();
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  
  const proximasSessoes = getProximasSessoes();
  
  // Calcular sessões de hoje
  const hojeStr = hoje.toISOString().split("T")[0];
  const sessoesHoje = sessoes.filter(s => {
    const sessaoDate = new Date(s.data_sessao).toISOString().split("T")[0];
    return sessaoDate === hojeStr && s.status === "agendada";
  });

  // Calcular receita mensal (sessões realizadas no mês)
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const receitaMensal = sessoes
    .filter(s => {
      const sessaoDate = new Date(s.data_sessao);
      return sessaoDate.getMonth() === mesAtual && 
             sessaoDate.getFullYear() === anoAtual && 
             s.status === "realizada" &&
             s.valor;
    })
    .reduce((acc, s) => acc + (s.valor || 0), 0);

  // Calcular pagamentos pendentes (sessões realizadas sem pagamento)
  const pagamentosPendentes = sessoes
    .filter(s => s.status === "realizada" && s.valor)
    .slice(0, 2);

  const stats = [
    {
      title: "Clientes",
      value: loadingClientes ? "..." : clientes.length.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Sessões Hoje",
      value: loadingSessoes ? "..." : sessoesHoje.length.toString(),
      icon: Calendar,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Receita Mensal",
      value: loadingSessoes ? "..." : `R$ ${receitaMensal.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Pacotes Ativos",
      value: "0",
      icon: Package,
      color: "text-accent-foreground",
      bg: "bg-accent",
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  if (loadingClientes || loadingSessoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {proximasSessoes.length > 0 ? (
              proximasSessoes.map((sessao) => (
                <div
                  key={sessao.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[70px]">
                      <p className="text-xs text-muted-foreground">{formatDate(sessao.data_sessao)}</p>
                      <p className="text-lg font-bold text-primary">{formatTime(sessao.horario)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sessao.cliente?.nome || "Cliente"}</p>
                      <p className="text-sm text-muted-foreground">{sessao.tipo_servico || "Serviço"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma sessão agendada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamentos Pendentes */}
        <Card className="shadow-brand-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Pagamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagamentosPendentes.length > 0 ? (
              pagamentosPendentes.map((pag) => (
                <div
                  key={pag.id}
                  className="p-3 rounded-lg bg-success/10 border border-success/20"
                >
                  <p className="text-2xl font-bold text-success">
                    R$ {(pag.valor || 0).toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {pag.cliente?.nome || "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum pagamento</p>
              </div>
            )}
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
