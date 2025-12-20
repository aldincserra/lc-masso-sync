import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Sessao } from "@/hooks/useSessoes";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessoesChartProps {
  sessoes: Sessao[];
}

export function SessoesChart({ sessoes }: SessoesChartProps) {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  
  // Agrupa sessões por semana
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });
  
  // Agrupa por semana
  const semanas: { semana: string; realizadas: number; agendadas: number; canceladas: number }[] = [];
  let semanaAtual = 1;
  let realizadas = 0;
  let agendadas = 0;
  let canceladas = 0;
  
  diasDoMes.forEach((dia, index) => {
    const sessoesNoDia = sessoes.filter(s => {
      const dataSessao = parseISO(s.data_sessao);
      return isSameDay(dataSessao, dia);
    });
    
    sessoesNoDia.forEach(s => {
      if (s.status === 'realizada') realizadas++;
      else if (s.status === 'agendada') agendadas++;
      else if (s.status === 'cancelada') canceladas++;
    });
    
    // Nova semana a cada 7 dias
    if ((index + 1) % 7 === 0 || index === diasDoMes.length - 1) {
      semanas.push({
        semana: `Sem ${semanaAtual}`,
        realizadas,
        agendadas,
        canceladas,
      });
      semanaAtual++;
      realizadas = 0;
      agendadas = 0;
      canceladas = 0;
    }
  });

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
          Sessões por Semana - {format(hoje, "MMMM yyyy", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={semanas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
