import { useState, useMemo } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, ChevronLeft, ChevronRight, Clock, Loader2, Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { useSessoes, SessaoFormData } from "@/hooks/useSessoes";
import { useClientes, ClienteFormData } from "@/hooks/useClientes";
import { cn } from "@/lib/utils";

const servicosDisponiveis = [
  "Massagem Relaxante",
  "Massagem Terapêutica",
  "Drenagem Linfática",
  "Massagem Desportiva",
  "Reflexologia",
  "Quick Massage",
];

export default function Agenda() {
  const { sessoes, loading, addSessao } = useSessoes();
  const { clientes, addCliente } = useClientes();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewClienteDialogOpen, setIsNewClienteDialogOpen] = useState(false);
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SessaoFormData>({
    cliente_id: "",
    data_sessao: "",
    horario: "",
    tipo_servico: "",
    valor: "",
    observacoes: "",
  });

  const [novoClienteForm, setNovoClienteForm] = useState<ClienteFormData>({
    nome: "",
    celular: "",
    email: "",
    data_nascimento: "",
    cpf: "",
    observacoes: "",
  });

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const hoje = new Date();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    await addSessao(formData);
    
    setIsDialogOpen(false);
    setFormData({
      cliente_id: "",
      data_sessao: "",
      horario: "",
      tipo_servico: "",
      valor: "",
      observacoes: "",
    });
    setSubmitting(false);
  };

  const handleNovoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const novoCliente = await addCliente(novoClienteForm);
    if (novoCliente) {
      setFormData({ ...formData, cliente_id: novoCliente.id });
      setIsNewClienteDialogOpen(false);
      setNovoClienteForm({
        nome: "",
        celular: "",
        email: "",
        data_nascimento: "",
        cpf: "",
        observacoes: "",
      });
    }
    setSubmitting(false);
  };

  const getSessoesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return sessoes.filter((s) => {
      const sessaoDate = new Date(s.data_sessao).toISOString().split("T")[0];
      return sessaoDate === dateStr;
    });
  };

  const selectedDateSessoes = getSessoesForDate(selectedDate);
  const selectedClienteName = useMemo(() => {
    const cliente = clientes.find(c => c.id === formData.cliente_id);
    return cliente?.nome || "";
  }, [clientes, formData.cliente_id]);

  if (loading) {
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
                <Label>Cliente</Label>
                <div className="flex gap-2">
                  <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={clientePopoverOpen}
                        className="flex-1 justify-between"
                      >
                        {selectedClienteName || "Selecione um cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {clientes.map((cliente) => (
                              <CommandItem
                                key={cliente.id}
                                value={cliente.nome}
                                onSelect={() => {
                                  setFormData({ ...formData, cliente_id: cliente.id });
                                  setClientePopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.cliente_id === cliente.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {cliente.nome}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsNewClienteDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Select
                  value={formData.tipo_servico}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_servico: value })
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
                    value={formData.data_sessao}
                    onChange={(e) =>
                      setFormData({ ...formData, data_sessao: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Horário</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.horario}
                    onChange={(e) =>
                      setFormData({ ...formData, horario: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  placeholder="0,00"
                />
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
                <Button 
                  type="submit" 
                  variant="brand" 
                  className="flex-1" 
                  disabled={submitting || !formData.cliente_id}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agendar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para novo cliente */}
        <Dialog open={isNewClienteDialogOpen} onOpenChange={setIsNewClienteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNovoCliente} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novoNome">Nome completo</Label>
                <Input
                  id="novoNome"
                  value={novoClienteForm.nome}
                  onChange={(e) =>
                    setNovoClienteForm({ ...novoClienteForm, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="novoCelular">Celular</Label>
                  <Input
                    id="novoCelular"
                    value={novoClienteForm.celular}
                    onChange={(e) =>
                      setNovoClienteForm({ ...novoClienteForm, celular: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novoEmail">E-mail</Label>
                  <Input
                    id="novoEmail"
                    type="email"
                    value={novoClienteForm.email}
                    onChange={(e) =>
                      setNovoClienteForm({ ...novoClienteForm, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNewClienteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" className="flex-1" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar e Selecionar"}
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
                    sessao.status === "realizada"
                      ? "bg-success/10 border-success/20"
                      : sessao.status === "cancelada"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                    <Clock className="h-4 w-4" />
                    {sessao.horario?.slice(0, 5) || "Horário não definido"}
                  </div>
                  <p className="font-medium text-foreground">
                    {sessao.cliente?.nome || "Cliente não encontrado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sessao.tipo_servico || "Serviço não especificado"}
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
