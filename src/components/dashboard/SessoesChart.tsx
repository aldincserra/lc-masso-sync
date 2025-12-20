import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { Sessao } from "@/hooks/useSessoes";
import { format, subDays, subMonths, eachWeekOfInterval, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Period, periodLabels } from "./PeriodFilter";

interface SessoesChartProps {
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

export function SessoesChart({ sessoes, period }: SessoesChartProps) {
  const { start, end } = getDateRange(period);
  
  // Filtra sessões pelo período
  const sessoesFiltradas = sessoes.filter(s => {
    const dataSessao = parseISO(s.data_sessao);
    return isWithinInterval(dataSessao, { start, end });
  });
  
  // Agrupa sessões por semana
  const semanas = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 });
  
  const dadosSemanas = semanas.map((inicioSemana, index) => {
    const fimSemana = endOfWeek(inicioSemana, { weekStartsOn: 0 });
    
    let realizadas = 0;
    let agendadas = 0;
    let canceladas = 0;
    
    sessoesFiltradas.forEach(s => {
      const dataSessao = parseISO(s.data_sessao);
      if (isWithinInterval(dataSessao, { start: inicioSemana, end: fimSemana })) {
        if (s.status === 'realizada') realizadas++;
        else if (s.status === 'agendada') agendadas++;
        else if (s.status === 'cancelada') canceladas++;
      }
    });
    
    return {
      semana: `S${index + 1}`,
      realizadas,
      agendadas,
      canceladas,
    };
  }).slice(-8); // Limita a 8 semanas para visualização

  const chartConfig = {
    realizadas: {
      label: "Realizadas",
      color: "hsl(142 70% 45%)",
    },
    agendadas: {
      label: "Agendadas",
      color: "hsl(174 55% 40%)",
    },
    canceladas: {
      label: "Canceladas",
      color: "hsl(0 72% 51%)",
    },
  };

  return (
    <Card className="shadow-brand-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">
          Sessões por Semana - {periodLabels[period]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={dadosSemanas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="semana" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="realizadas" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="agendadas" fill="hsl(174 55% 40%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="canceladas" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Realizadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Agendadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Canceladas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
