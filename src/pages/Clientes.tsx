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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Pencil, Trash2, Phone, Users, History, Loader2 } from "lucide-react";
import { useClientes, ClienteFormData, Cliente } from "@/hooks/useClientes";
import { useSessoes } from "@/hooks/useSessoes";
import { ClienteHistoricoDialog } from "@/components/ClienteHistoricoDialog";
import { formatPhone, isPhoneValid, formatCPF, isCPFValid, isEmailValid } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export default function Clientes() {
  const { clientes, loading, addCliente, updateCliente, deleteCliente } = useClientes();
  const { sessoes, getSessoesCliente } = useSessoes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [historicoCliente, setHistoricoCliente] = useState<Cliente | null>(null);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState<ClienteFormData>({
    nome: "",
    celular: "",
    email: "",
    data_nascimento: "",
    cpf: "",
    observacoes: "",
  });

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.cpf && cliente.cpf.includes(searchTerm))
  );

  const handleOpenDialog = (cliente?: Cliente) => {
    setErrors({});
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        celular: cliente.celular || "",
        email: cliente.email || "",
        data_nascimento: cliente.data_nascimento || "",
        cpf: cliente.cpf || "",
        observacoes: cliente.observacoes || "",
      });
    } else {
      setEditingCliente(null);
      setFormData({ nome: "", celular: "", email: "", data_nascimento: "", cpf: "", observacoes: "" });
    }
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.celular && !isPhoneValid(formData.celular)) {
      newErrors.celular = "Celular deve ter 11 dígitos";
    }

    if (formData.cpf && !isCPFValid(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (formData.email && !isEmailValid(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Verifique os campos", description: "Corrija os erros indicados.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    if (editingCliente) {
      await updateCliente(editingCliente.id, formData);
    } else {
      await addCliente(formData);
    }
    setIsDialogOpen(false);
    setEditingCliente(null);
    setSubmitting(false);
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, celular: formatPhone(value) });
    if (errors.celular) setErrors({ ...errors, celular: "" });
  };

  const handleCPFChange = (value: string) => {
    setFormData({ ...formData, cpf: formatCPF(value) });
    if (errors.cpf) setErrors({ ...errors, cpf: "" });
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    if (errors.email) setErrors({ ...errors, email: "" });
  };

  const handleDelete = async (cliente: Cliente) => {
    await deleteCliente(cliente.id, cliente.nome);
  };

  const handleViewHistorico = (cliente: Cliente) => {
    setHistoricoCliente(cliente);
    setIsHistoricoOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

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
          <h1 className="font-display text-3xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e informações de contato</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                  {errors.celular && <p className="text-xs text-destructive">{errors.celular}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="brand" className="flex-1" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCliente ? "Salvar" : "Cadastrar"}
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
              placeholder="Buscar por nome, e-mail ou CPF..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Celular</TableHead>
                  <TableHead className="hidden lg:table-cell">E-mail</TableHead>
                  <TableHead className="hidden xl:table-cell">Data Nasc.</TableHead>
                  <TableHead className="hidden xl:table-cell">CPF</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <button
                          onClick={() => handleViewHistorico(cliente)}
                          className="font-medium text-primary hover:underline cursor-pointer text-left"
                        >
                          {cliente.nome}
                        </button>
                        <div className="flex gap-2 md:hidden text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.celular || "-"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.celular || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{cliente.email || "-"}</TableCell>
                    <TableCell className="hidden xl:table-cell">{formatDate(cliente.data_nascimento)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{cliente.cpf || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewHistorico(cliente)}>
                            <History className="h-4 w-4 mr-2" />
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog(cliente)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cliente)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredClientes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ClienteHistoricoDialog
        cliente={historicoCliente}
        sessoes={historicoCliente ? getSessoesCliente(historicoCliente.id) : []}
        isOpen={isHistoricoOpen}
        onClose={() => setIsHistoricoOpen(false)}
      />
    </div>
  );
}
