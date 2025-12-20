import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Period = "30d" | "3m" | "6m" | "1y";

interface PeriodFilterProps {
  value: Period;
  onChange: (value: Period) => void;
}

export const periodLabels: Record<Period, string> = {
  "30d": "Últimos 30 dias",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "1y": "Último ano",
};

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Period)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30d">{periodLabels["30d"]}</SelectItem>
        <SelectItem value="3m">{periodLabels["3m"]}</SelectItem>
        <SelectItem value="6m">{periodLabels["6m"]}</SelectItem>
        <SelectItem value="1y">{periodLabels["1y"]}</SelectItem>
      </SelectContent>
    </Select>
  );
}
