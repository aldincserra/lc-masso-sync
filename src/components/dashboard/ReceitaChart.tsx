import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Sessao } from "@/hooks/useSessoes";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceitaChartProps {
  sessoes: Sessao[];
}

export function ReceitaChart({ sessoes }: ReceitaChartProps) {
  const hoje = new Date();
  
  // Últimos 6 meses
  const dadosMensais = Array.from({ length: 6 }, (_, i) => {
    const mes = subMonths(hoje, 5 - i);
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);
    
    const receitaMes = sessoes
      .filter(s => {
        const dataSessao = parseISO(s.data_sessao);
        return dataSessao >= inicioMes && 
               dataSessao <= fimMes && 
               s.status === "realizada" && 
               s.valor;
      })
      .reduce((acc, s) => acc + (s.valor || 0), 0);
    
    return {
      mes: format(mes, "MMM", { locale: ptBR }),
      receita: receitaMes,
    };
  });

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "hsl(174 55% 40%)",
    },
  };

  return (
    <Card className="shadow-brand-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">Evolução da Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={dadosMensais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174 55% 40%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(174 55% 40%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="mes" 
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
