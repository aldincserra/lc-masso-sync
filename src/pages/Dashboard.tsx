import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientes } from "@/hooks/useClientes";
import { useSessoes } from "@/hooks/useSessoes";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SessoesChart } from "@/components/dashboard/SessoesChart";
import { ReceitaChart } from "@/components/dashboard/ReceitaChart";
import { ServicosPieChart } from "@/components/dashboard/ServicosPieChart";
import { PeriodFilter, Period } from "@/components/dashboard/PeriodFilter";

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("3m");
  const { clientes, loading: loadingClientes } = useClientes();
  const { sessoes, loading: loadingSessoes, getProximasSessoes } = useSessoes();
  
  const hoje = new Date();
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
  const sessoesRealizadasMes = sessoes.filter(s => {
    const sessaoDate = new Date(s.data_sessao);
    return sessaoDate.getMonth() === mesAtual && 
           sessaoDate.getFullYear() === anoAtual && 
           s.status === "realizada";
  });
  
  const receitaMensal = sessoesRealizadasMes
    .filter(s => s.valor)
    .reduce((acc, s) => acc + (s.valor || 0), 0);

  // Pagamentos recentes
  const pagamentosRecentes = sessoes
    .filter(s => s.status === "realizada" && s.valor)
    .slice(0, 2);

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

      {/* Stats Cards */}
      <StatsCards
        totalClientes={clientes.length}
        sessoesHoje={sessoesHoje.length}
        receitaMensal={receitaMensal}
        sessoesRealizadasMes={sessoesRealizadasMes.length}
        loading={loadingClientes || loadingSessoes}
      />

      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-medium text-foreground">Estatísticas</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SessoesChart sessoes={sessoes} period={period} />
        <ReceitaChart sessoes={sessoes} period={period} />
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

        {/* Serviços Pie Chart */}
        <ServicosPieChart sessoes={sessoes} period={period} />
      </div>

      {/* Pagamentos Recentes */}
      <Card className="shadow-brand-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-lg">Pagamentos Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pagamentos" className="text-primary">
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pagamentosRecentes.length > 0 ? (
              pagamentosRecentes.map((pag) => (
                <div
                  key={pag.id}
                  className="p-4 rounded-lg bg-success/10 border border-success/20"
                >
                  <p className="text-2xl font-bold text-success">
                    R$ {(pag.valor || 0).toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pag.cliente?.nome || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pag.tipo_servico || "Serviço"}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum pagamento registrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
