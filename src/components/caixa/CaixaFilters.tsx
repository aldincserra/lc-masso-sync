import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CaixaFilterType = "mes" | "semana" | "personalizado";

export interface CaixaDateRange {
  from: Date;
  to: Date;
}

interface CaixaFiltersProps {
  activeFilter: CaixaFilterType;
  dateRange: CaixaDateRange;
  onFilterChange: (filter: CaixaFilterType, range: CaixaDateRange) => void;
}

export function CaixaFilters({ activeFilter, dateRange, onFilterChange }: CaixaFiltersProps) {
  const [customFrom, setCustomFrom] = useState<Date | undefined>(dateRange.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(dateRange.to);

  const hoje = new Date();

  const handleMes = () => {
    onFilterChange("mes", { from: startOfMonth(hoje), to: endOfMonth(hoje) });
  };

  const handleSemana = () => {
    onFilterChange("semana", {
      from: startOfWeek(hoje, { weekStartsOn: 0 }),
      to: endOfWeek(hoje, { weekStartsOn: 0 }),
    });
  };

  const handleCustomDate = (type: "from" | "to", date: Date | undefined) => {
    if (!date) return;
    const newFrom = type === "from" ? date : (customFrom || hoje);
    const newTo = type === "to" ? date : (customTo || hoje);
    if (type === "from") setCustomFrom(date);
    else setCustomTo(date);
    onFilterChange("personalizado", { from: newFrom, to: newTo });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeFilter === "mes" ? "brand" : "outline"}
        size="sm"
        onClick={handleMes}
      >
        Mês vigente
      </Button>
      <Button
        variant={activeFilter === "semana" ? "brand" : "outline"}
        size="sm"
        onClick={handleSemana}
      >
        Semana vigente
      </Button>
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === "personalizado" ? "brand" : "outline"}
              size="sm"
              className="gap-1"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {customFrom ? format(customFrom, "dd/MM/yy") : "De"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={customFrom}
              onSelect={(d) => handleCustomDate("from", d)}
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <span className="text-muted-foreground text-sm">até</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={activeFilter === "personalizado" ? "brand" : "outline"}
              size="sm"
              className="gap-1"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {customTo ? format(customTo, "dd/MM/yy") : "Até"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={customTo}
              onSelect={(d) => handleCustomDate("to", d)}
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
