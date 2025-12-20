import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { Sessao } from "@/hooks/useSessoes";
import { format, subDays, subMonths, startOfMonth, endOfMonth, parseISO, eachMonthOfInterval, isWithinInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Period, periodLabels } from "./PeriodFilter";

interface ReceitaChartProps {
  sessoes: Sessao[];
  period: Period;
}

function getDateRange(period: Period): { start: Date; end: Date } {
  const hoje = new Date();
  switch (period) {
    case "30d":
      return { start: subDays(hoje, 30), end: hoje };
    case "3m":
      return { start: subMonths(hoje, 3), end: hoje };
    case "6m":
      return { start: subMonths(hoje, 6), end: hoje };
    case "1y":
      return { start: subMonths(hoje, 12), end: hoje };
  }
}

export function ReceitaChart({ sessoes, period }: ReceitaChartProps) {
  const { start, end } = getDateRange(period);
  
  // Filtra sessões pelo período
  const sessoesFiltradas = sessoes.filter(s => {
    const dataSessao = parseISO(s.data_sessao);
    return isWithinInterval(dataSessao, { start, end }) && 
           s.status === "realizada" && 
           s.valor;
  });
  
  // Para períodos curtos (30d), agrupa por semana; para outros, por mês
  let dadosReceita: { periodo: string; receita: number }[] = [];
  
  if (period === "30d") {
    const semanas = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 });
    dadosReceita = semanas.map((inicioSemana, index) => {
      const fimSemana = endOfWeek(inicioSemana, { weekStartsOn: 0 });
      const receitaSemana = sessoesFiltradas
        .filter(s => {
          const dataSessao = parseISO(s.data_sessao);
          return isWithinInterval(dataSessao, { start: inicioSemana, end: fimSemana });
        })
        .reduce((acc, s) => acc + (s.valor || 0), 0);
      
      return {
        periodo: `S${index + 1}`,
        receita: receitaSemana,
      };
    });
  } else {
    const meses = eachMonthOfInterval({ start, end });
    dadosReceita = meses.map(mes => {
      const inicioMes = startOfMonth(mes);
      const fimMes = endOfMonth(mes);
      const receitaMes = sessoesFiltradas
        .filter(s => {
          const dataSessao = parseISO(s.data_sessao);
          return isWithinInterval(dataSessao, { start: inicioMes, end: fimMes });
        })
        .reduce((acc, s) => acc + (s.valor || 0), 0);
      
      return {
        periodo: format(mes, "MMM", { locale: ptBR }),
        receita: receitaMes,
      };
    });
  }

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "hsl(174 55% 40%)",
    },
  };

  return (
    <Card className="shadow-brand-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">
          Evolução da Receita - {periodLabels[period]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={dadosReceita} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174 55% 40%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(174 55% 40%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="periodo" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [`R$ ${Number(value).toFixed(2).replace(".", ",")}`, "Receita"]}
            />
            <Area 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(174 55% 40%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorReceita)" 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
