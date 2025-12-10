import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface Sessao {
  id: string;
  clienteNome: string;
  servico: string;
  data: string;
  hora: string;
  duracao: number;
  status: "agendada" | "concluida" | "cancelada";
}

const sessoesMock: Sessao[] = [
  {
    id: "1",
    clienteNome: "Maria Silva",
    servico: "Massagem Relaxante",
    data: "2024-12-10",
    hora: "09:00",
    duracao: 60,
    status: "agendada",
  },
  {
    id: "2",
    clienteNome: "João Santos",
    servico: "Massagem Terapêutica",
    data: "2024-12-10",
    hora: "10:30",
    duracao: 90,
    status: "agendada",
  },
  {
    id: "3",
    clienteNome: "Ana Oliveira",
    servico: "Drenagem Linfática",
    data: "2024-12-10",
    hora: "14:00",
    duracao: 60,
    status: "concluida",
  },
];

const servicosDisponiveis = [
  "Massagem Relaxante",
  "Massagem Terapêutica",
  "Drenagem Linfática",
  "Massagem Desportiva",
  "Reflexologia",
  "Quick Massage",
];

export default function Agenda() {
  const [sessoes, setSessoes] = useState<Sessao[]>(sessoesMock);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clienteNome: "",
    servico: "",
    data: "",
    hora: "",
    duracao: "60",
  });

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const hoje = new Date();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const days = getDaysInMonth(selectedDate);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaSessao: Sessao = {
      id: Date.now().toString(),
      clienteNome: formData.clienteNome,
      servico: formData.servico,
      data: formData.data,
      hora: formData.hora,
      duracao: parseInt(formData.duracao),
      status: "agendada",
    };

    setSessoes([...sessoes, novaSessao]);
    setIsDialogOpen(false);
    setFormData({
      clienteNome: "",
      servico: "",
      data: "",
      hora: "",
      duracao: "60",
    });

    toast({
      title: "Sessão agendada!",
      description: `${formData.clienteNome} - ${formData.servico}`,
    });
  };

  const getSessoesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return sessoes.filter((s) => s.data === dateStr);
  };

  const selectedDateSessoes = getSessoesForDate(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Agenda
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas sessões e horários
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand">
              <Plus className="h-4 w-4" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Agendar Sessão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clienteNome">Nome do Cliente</Label>
                <Input
                  id="clienteNome"
                  value={formData.clienteNome}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteNome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Select
                  value={formData.servico}
                  onValueChange={(value) =>
                    setFormData({ ...formData, servico: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicosDisponiveis.map((servico) => (
                      <SelectItem key={servico} value={servico}>
                        {servico}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Horário</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Select
                  value={formData.duracao}
                  onValueChange={(value) =>
                    setFormData({ ...formData, duracao: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" className="flex-1">
                  Agendar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-brand-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">
              {selectedDate.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="text-xs font-medium text-muted-foreground py-2"
                >
                  {dia}
                </div>
              ))}
              {days.map((day, i) => {
                const isToday =
                  day?.toDateString() === hoje.toDateString();
                const isSelected =
                  day?.toDateString() === selectedDate.toDateString();
                const hasSessoes = day && getSessoesForDate(day).length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day}
                    className={`py-2 text-sm rounded-lg transition-colors relative ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : isToday
                        ? "bg-accent text-accent-foreground font-medium"
                        : day
                        ? "text-foreground hover:bg-muted"
                        : ""
                    }`}
                  >
                    {day?.getDate()}
                    {hasSessoes && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Sessions */}
        <Card className="shadow-brand-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateSessoes.length > 0 ? (
              selectedDateSessoes.map((sessao) => (
                <div
                  key={sessao.id}
                  className={`p-3 rounded-lg border ${
                    sessao.status === "concluida"
                      ? "bg-success/10 border-success/20"
                      : sessao.status === "cancelada"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                    <Clock className="h-4 w-4" />
                    {sessao.hora} - {sessao.duracao}min
                  </div>
                  <p className="font-medium text-foreground">
                    {sessao.clienteNome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sessao.servico}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma sessão agendada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
