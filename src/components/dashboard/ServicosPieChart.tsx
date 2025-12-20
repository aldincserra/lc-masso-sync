import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Sessao } from "@/hooks/useSessoes";

interface ServicosPieChartProps {
  sessoes: Sessao[];
}

const COLORS = [
  "hsl(174 55% 40%)",
  "hsl(142 70% 45%)",
  "hsl(38 92% 50%)",
  "hsl(200 80% 50%)",
  "hsl(280 70% 50%)",
  "hsl(350 80% 50%)",
];

export function ServicosPieChart({ sessoes }: ServicosPieChartProps) {
  // Agrupa por tipo de serviço
  const servicosMap: Record<string, number> = {};
  
  sessoes.forEach(s => {
    const servico = s.tipo_servico || "Não especificado";
    servicosMap[servico] = (servicosMap[servico] || 0) + 1;
  });

  const dadosServicos = Object.entries(servicosMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const chartConfig = dadosServicos.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (dadosServicos.length === 0) {
    return (
      <Card className="shadow-brand-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Serviços Mais Realizados</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-brand-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">Serviços Mais Realizados</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <Pie
              data={dadosServicos}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {dadosServicos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {dadosServicos.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
