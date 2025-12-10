import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, FileText, Printer, Send, Search, MessageCircle, Mail } from "lucide-react";

interface Recibo {
  id: string;
  numero: string;
  clienteNome: string;
  clienteCpf: string;
  descricao: string;
  valor: number;
  data: string;
  enviado: boolean;
}

const recibosMock: Recibo[] = [
  {
    id: "1",
    numero: "2024001",
    clienteNome: "Maria Silva",
    clienteCpf: "123.456.789-00",
    descricao: "Massagem Relaxante - 1 sessão",
    valor: 150.0,
    data: "2024-12-10",
    enviado: true,
  },
  {
    id: "2",
    numero: "2024002",
    clienteNome: "João Santos",
    clienteCpf: "987.654.321-00",
    descricao: "Pacote Terapêutico - 10 sessões",
    valor: 1100.0,
    data: "2024-12-09",
    enviado: false,
  },
];

export default function Recibos() {
  const [recibos, setRecibos] = useState<Recibo[]>(recibosMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewRecibo, setPreviewRecibo] = useState<Recibo | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clienteNome: "",
    clienteCpf: "",
    descricao: "",
    valor: "",
  });

  const filteredRecibos = recibos.filter(
    (r) =>
      r.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numero.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const novoRecibo: Recibo = {
      id: Date.now().toString(),
      numero: `2024${(recibos.length + 1).toString().padStart(3, "0")}`,
      clienteNome: formData.clienteNome,
      clienteCpf: formData.clienteCpf,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: new Date().toISOString().split("T")[0],
      enviado: false,
    };

    setRecibos([novoRecibo, ...recibos]);
    setIsDialogOpen(false);
    setFormData({
      clienteNome: "",
      clienteCpf: "",
      descricao: "",
      valor: "",
    });

    toast({
      title: "Recibo emitido!",
      description: `Recibo nº ${novoRecibo.numero} foi criado.`,
    });
  };

  const handlePrint = (recibo: Recibo) => {
    setPreviewRecibo(recibo);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSendWhatsApp = (recibo: Recibo) => {
    const message = encodeURIComponent(
      `*Recibo nº ${recibo.numero}*\n\n` +
      `Cliente: ${recibo.clienteNome}\n` +
      `CPF: ${recibo.clienteCpf}\n` +
      `Descrição: ${recibo.descricao}\n` +
      `Valor: R$ ${recibo.valor.toFixed(2).replace(".", ",")}\n` +
      `Data: ${new Date(recibo.data).toLocaleDateString("pt-BR")}\n\n` +
      `_LC Massoterapia - Laís Castro_`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
    
    setRecibos(recibos.map((r) => 
      r.id === recibo.id ? { ...r, enviado: true } : r
    ));
    
    toast({
      title: "WhatsApp aberto!",
      description: "Selecione o contato para enviar o recibo.",
    });
  };

  const handleSendEmail = (recibo: Recibo) => {
    const subject = encodeURIComponent(`Recibo nº ${recibo.numero} - LC Massoterapia`);
    const body = encodeURIComponent(
      `Recibo nº ${recibo.numero}\n\n` +
      `Cliente: ${recibo.clienteNome}\n` +
      `CPF: ${recibo.clienteCpf}\n` +
      `Descrição: ${recibo.descricao}\n` +
      `Valor: R$ ${recibo.valor.toFixed(2).replace(".", ",")}\n` +
      `Data: ${new Date(recibo.data).toLocaleDateString("pt-BR")}\n\n` +
      `LC Massoterapia - Laís Castro`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    
    setRecibos(recibos.map((r) => 
      r.id === recibo.id ? { ...r, enviado: true } : r
    ));

    toast({
      title: "E-mail aberto!",
      description: "Complete o envio no seu cliente de e-mail.",
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
            Recibos
          </h1>
          <p className="text-muted-foreground">
            Emita e envie recibos para seus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand">
              <Plus className="h-4 w-4" />
              Novo Recibo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Emitir Recibo</DialogTitle>
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
                <Label htmlFor="clienteCpf">CPF</Label>
                <Input
                  id="clienteCpf"
                  value={formData.clienteCpf}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteCpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Serviço</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  rows={2}
                  required
                />
              </div>
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
                  Emitir
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-brand-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou número..."
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
                  <TableHead>Nº</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecibos.map((recibo) => (
                  <TableRow key={recibo.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      #{recibo.numero}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(recibo.data)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {recibo.clienteNome}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {recibo.descricao}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(recibo.valor)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={recibo.enviado ? "default" : "secondary"}
                        className={
                          recibo.enviado
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {recibo.enviado ? "Enviado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(recibo)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendWhatsApp(recibo)}
                          title="WhatsApp"
                          className="text-success hover:text-success"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendEmail(recibo)}
                          title="E-mail"
                          className="text-primary hover:text-primary"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredRecibos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum recibo encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Preview (hidden, used for printing) */}
      {previewRecibo && (
        <div className="hidden print:block fixed inset-0 bg-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary">LC Massoterapia</h1>
              <p className="text-gray-600">Laís Castro - Massoterapeuta</p>
            </div>
            <div className="border-2 border-primary rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">RECIBO</h2>
              <p className="text-right text-sm text-gray-600 mb-4">
                Nº {previewRecibo.numero}
              </p>
              <div className="space-y-3 mb-6">
                <p>
                  <strong>Cliente:</strong> {previewRecibo.clienteNome}
                </p>
                <p>
                  <strong>CPF:</strong> {previewRecibo.clienteCpf}
                </p>
                <p>
                  <strong>Descrição:</strong> {previewRecibo.descricao}
                </p>
                <p>
                  <strong>Valor:</strong> {formatCurrency(previewRecibo.valor)}
                </p>
                <p>
                  <strong>Data:</strong> {formatDate(previewRecibo.data)}
                </p>
              </div>
              <div className="mt-12 pt-8 border-t text-center">
                <div className="w-48 mx-auto border-b border-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Laís Castro - Massoterapeuta</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
