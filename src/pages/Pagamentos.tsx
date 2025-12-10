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
import { Plus, TrendingUp, TrendingDown, DollarSign, Search } from "lucide-react";

interface Pagamento {
  id: string;
  clienteNome: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: "entrada" | "saida";
  formaPagamento: string;
  status: "pago" | "pendente";
}

const pagamentosMock: Pagamento[] = [
  {
    id: "1",
    clienteNome: "Maria Silva",
    descricao: "Massagem Relaxante",
    valor: 150.0,
    data: "2024-12-10",
    tipo: "entrada",
    formaPagamento: "PIX",
    status: "pago",
  },
  {
    id: "2",
    clienteNome: "João Santos",
    descricao: "Pacote 5 sessões",
    valor: 600.0,
    data: "2024-12-09",
    tipo: "entrada",
    formaPagamento: "Cartão",
    status: "pago",
  },
  {
    id: "3",
    clienteNome: "Marta Souza",
    descricao: "Drenagem Linfática",
    valor: 120.0,
    data: "2024-12-08",
    tipo: "entrada",
    formaPagamento: "-",
    status: "pendente",
  },
  {
    id: "4",
    clienteNome: "-",
    descricao: "Óleos essenciais",
    valor: 85.0,
    data: "2024-12-07",
    tipo: "saida",
    formaPagamento: "Débito",
    status: "pago",
  },
];

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clienteNome: "",
    descricao: "",
    valor: "",
    tipo: "entrada" as "entrada" | "saida",
    formaPagamento: "",
    status: "pago" as "pago" | "pendente",
  });

  const totalEntradas = pagamentos
    .filter((p) => p.tipo === "entrada" && p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalSaidas = pagamentos
    .filter((p) => p.tipo === "saida" && p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = pagamentos
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.valor, 0);

  const saldo = totalEntradas - totalSaidas;

  const filteredPagamentos = pagamentos.filter(
    (p) =>
      p.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoPagamento: Pagamento = {
      id: Date.now().toString(),
      clienteNome: formData.clienteNome || "-",
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: new Date().toISOString().split("T")[0],
      tipo: formData.tipo,
      formaPagamento: formData.formaPagamento,
      status: formData.status,
    };

    setPagamentos([novoPagamento, ...pagamentos]);
    setIsDialogOpen(false);
    setFormData({
      clienteNome: "",
      descricao: "",
      valor: "",
      tipo: "entrada",
      formaPagamento: "",
      status: "pago",
    });

    toast({
      title: "Lançamento registrado!",
      description: `${formData.descricao} - R$ ${formData.valor}`,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Caixa
          </h1>
          <p className="text-muted-foreground">
            Controle financeiro da clínica
          </p>
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
              <DialogTitle className="font-display">
                Novo Lançamento
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "entrada" | "saida") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.tipo === "entrada" && (
                <div className="space-y-2">
                  <Label htmlFor="clienteNome">Cliente</Label>
                  <Input
                    id="clienteNome"
                    value={formData.clienteNome}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteNome: e.target.value })
                    }
                    placeholder="Nome do cliente"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  required
                />
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
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, formaPagamento: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                    <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
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
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-brand-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="text-lg font-bold text-destructive">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-lg font-bold text-warning">
                  {formatCurrency(totalPendente)}
                </p>
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
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(saldo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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

      {/* Table */}
      <Card className="shadow-brand-sm overflow-hidden">
        <CardContent className="p-0">
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
                {filteredPagamentos.map((pag) => (
                  <TableRow key={pag.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">
                      {formatDate(pag.data)}
                    </TableCell>
                    <TableCell className="font-medium">{pag.descricao}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pag.clienteNome}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {pag.formaPagamento}
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        pag.tipo === "entrada" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {pag.tipo === "entrada" ? "+" : "-"}
                      {formatCurrency(pag.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pag.status === "pago" ? "default" : "secondary"}
                        className={
                          pag.status === "pago"
                            ? "bg-success text-success-foreground"
                            : "bg-warning/20 text-warning"
                        }
                      >
                        {pag.status === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
