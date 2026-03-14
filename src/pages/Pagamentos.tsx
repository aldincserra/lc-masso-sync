import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, DollarSign, Search, Loader2 } from "lucide-react";
import { CaixaFilters, CaixaFilterType, CaixaDateRange } from "@/components/caixa/CaixaFilters";
import { useSessoes, Sessao } from "@/hooks/useSessoes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useClientes } from "@/hooks/useClientes";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { SessaoDetailDialog } from "@/components/sessao/SessaoDetailDialog";

export default function Pagamentos() {
  const hoje = new Date();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CaixaFilterType>("mes");
  const [dateRange, setDateRange] = useState<CaixaDateRange>({
    from: startOfMonth(hoje),
    to: endOfMonth(hoje),
  });
  const { sessoes } = useSessoes();
  const { pagamentos, loading, fetchPagamentos, addPagamento } = usePagamentos();
  const { clientes } = useClientes();
  const [selectedSessao, setSelectedSessao] = useState<Sessao | null>(null);
  const [isSessaoDetailOpen, setIsSessaoDetailOpen] = useState(false);
  const { toast } = useToast();

  const [showSessoesList, setShowSessoesList] = useState(false);
  const sessoesAgendadas = sessoes.filter(s => s.status === "agendada");

  const [formData, setFormData] = useState({
    clienteNome: "",
    clienteId: "",
    descricao: "",
    valor: "",
    tipo: "entrada" as "entrada" | "saida",
    formaPagamento: "",
    status: "pago" as "pago" | "pendente",
    sessaoId: "",
  });

  const handleFilterChange = (filter: CaixaFilterType, range: CaixaDateRange) => {
    setActiveFilter(filter);
    setDateRange(range);
  };

  // Map pagamentos to displayable rows
  const displayRows = pagamentos.map((p) => ({
    id: p.id,
    clienteNome: p.cliente?.nome || "-",
    descricao: p.sessao?.tipo_servico || (p.forma_pagamento ? "Pagamento" : "Lançamento"),
    valor: p.valor,
    data: p.data_pagamento,
    tipo: "entrada" as const, // pagamentos table stores entries; for saidas we check valor sign or status
    formaPagamento: p.forma_pagamento || "-",
    status: (p.status || "pendente") as "pago" | "pendente",
  }));

  // Filter by date range
  const dateFilteredPagamentos = displayRows.filter((p) => {
    const pDate = new Date(p.data + "T12:00:00");
    return isWithinInterval(pDate, { start: dateRange.from, end: dateRange.to });
  });

  const statusFilteredPagamentos = statusFilter
    ? dateFilteredPagamentos.filter((p) => p.status === statusFilter)
    : dateFilteredPagamentos;

  const filteredPagamentos = statusFilteredPagamentos.filter(
    (p) =>
      p.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEntradas = dateFilteredPagamentos
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalSaidas = 0; // saídas not tracked in pagamentos table yet

  const totalPendente = dateFilteredPagamentos
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.valor, 0);

  const saldo = totalEntradas - totalSaidas;

  const handleSelectSessao = (sessao: Sessao) => {
    setFormData({
      ...formData,
      descricao: `${sessao.tipo_servico || "Sessão"} - ${sessao.cliente?.nome || "Cliente"}`,
      clienteNome: sessao.cliente?.nome || "",
      clienteId: sessao.cliente_id,
      valor: (sessao.valor || 0).toString(),
      sessaoId: sessao.id,
    });
    setShowSessoesList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find client id
    let clienteId = formData.clienteId;
    if (!clienteId && formData.clienteNome) {
      const found = clientes.find(c => c.nome.toLowerCase() === formData.clienteNome.toLowerCase());
      if (found) clienteId = found.id;
    }

    if (!clienteId) {
      toast({ title: "Selecione um cliente válido", variant: "destructive" });
      return;
    }

    await addPagamento({
      cliente_id: clienteId,
      sessao_id: formData.sessaoId || undefined,
      valor: parseFloat(formData.valor),
      data_pagamento: new Date().toISOString().split("T")[0],
      forma_pagamento: formData.formaPagamento,
      status: formData.status,
    });

    setIsDialogOpen(false);
    setFormData({
      clienteNome: "",
      clienteId: "",
      descricao: "",
      valor: "",
      tipo: "entrada",
      formaPagamento: "",
      status: "pago",
      sessaoId: "",
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");

  const handleStatusCardClick = (status: string | null) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  const handleSessaoStatusUpdate = () => {
    fetchPagamentos();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Caixa</h1>
          <p className="text-muted-foreground">Controle financeiro da clínica</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand">
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Lançamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => {
                    const cliente = clientes.find(c => c.id === value);
                    setFormData({ ...formData, clienteId: value, clienteNome: cliente?.nome || "" });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      required
                      placeholder="Ou selecione uma sessão abaixo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSessoesList(!showSessoesList)}
                    >
                      Sessões
                    </Button>
                  </div>
                  {showSessoesList && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-1 space-y-1">
                      {sessoesAgendadas.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2">Nenhuma sessão agendada</p>
                      ) : (
                        sessoesAgendadas.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectSessao(s)}
                            className="w-full text-left text-xs p-2 rounded hover:bg-muted transition-colors"
                          >
                            <span className="font-medium">{s.cliente?.nome}</span> -{" "}
                            <span className="text-muted-foreground">{s.tipo_servico}</span> -{" "}
                            <span className="text-primary">R$ {(s.valor || 0).toFixed(2).replace(".", ",")}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "pago" | "pendente") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value) => setFormData({ ...formData, formaPagamento: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                    <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" className="flex-1">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <CaixaFilters activeFilter={activeFilter} dateRange={dateRange} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="shadow-brand-sm cursor-pointer hover:shadow-brand-md transition-shadow"
          onClick={() => handleStatusCardClick("pago")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalEntradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="shadow-brand-sm cursor-pointer hover:shadow-brand-md transition-shadow"
          onClick={() => handleStatusCardClick("pago")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="shadow-brand-sm cursor-pointer hover:shadow-brand-md transition-shadow"
          onClick={() => handleStatusCardClick("pendente")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-lg font-bold text-warning">{formatCurrency(totalPendente)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(saldo)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {statusFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Filtro: {statusFilter === "pago" ? "Pagos" : "Pendentes"}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>Limpar</Button>
        </div>
      )}

      <Card className="shadow-brand-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lançamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-brand-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum lançamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPagamentos.map((pag) => (
                      <TableRow key={pag.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm">{formatDate(pag.data)}</TableCell>
                        <TableCell className="font-medium">{pag.descricao}</TableCell>
                        <TableCell className="hidden md:table-cell">{pag.clienteNome}</TableCell>
                        <TableCell className="hidden lg:table-cell">{pag.formaPagamento}</TableCell>
                        <TableCell className="font-bold text-success">
                          +{formatCurrency(pag.valor)}
                        </TableCell>
                        <TableCell>
                          <button onClick={() => handleStatusCardClick(pag.status)}>
                            <Badge
                              variant={pag.status === "pago" ? "default" : "secondary"}
                              className={`cursor-pointer ${
                                pag.status === "pago"
                                  ? "bg-success text-success-foreground"
                                  : "bg-warning/20 text-warning"
                              }`}
                            >
                              {pag.status === "pago" ? "Pago" : "Pendente"}
                            </Badge>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SessaoDetailDialog
        sessao={selectedSessao}
        isOpen={isSessaoDetailOpen}
        onClose={() => setIsSessaoDetailOpen(false)}
        onStatusUpdate={handleSessaoStatusUpdate}
      />
    </div>
  );
}
