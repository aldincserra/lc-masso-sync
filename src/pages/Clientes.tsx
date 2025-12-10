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
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MoreVertical, Pencil, Trash2, Phone, Mail, Users } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  celular: string;
  email: string;
  dataNascimento: string;
  cpf: string;
}

// Mock data - will be replaced with Supabase
const clientesMock: Cliente[] = [
  {
    id: "1",
    nome: "Maria Silva",
    celular: "(11) 99999-1234",
    email: "maria@email.com",
    dataNascimento: "1985-05-15",
    cpf: "123.456.789-00",
  },
  {
    id: "2",
    nome: "João Santos",
    celular: "(11) 98888-5678",
    email: "joao@email.com",
    dataNascimento: "1990-08-22",
    cpf: "987.654.321-00",
  },
  {
    id: "3",
    nome: "Ana Oliveira",
    celular: "(11) 97777-9012",
    email: "ana@email.com",
    dataNascimento: "1988-12-03",
    cpf: "456.789.123-00",
  },
];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    celular: "",
    email: "",
    dataNascimento: "",
    cpf: "",
  });

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.includes(searchTerm)
  );

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        celular: cliente.celular,
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
        cpf: cliente.cpf,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nome: "",
        celular: "",
        email: "",
        dataNascimento: "",
        cpf: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCliente) {
      setClientes(
        clientes.map((c) =>
          c.id === editingCliente.id ? { ...c, ...formData } : c
        )
      );
      toast({
        title: "Cliente atualizado!",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });
    } else {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
      };
      setClientes([...clientes, novoCliente]);
      toast({
        title: "Cliente cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso.`,
      });
    }
    
    setIsDialogOpen(false);
    setEditingCliente(null);
  };

  const handleDelete = (cliente: Cliente) => {
    setClientes(clientes.filter((c) => c.id !== cliente.id));
    toast({
      title: "Cliente excluído",
      description: `${cliente.nome} foi removido.`,
      variant: "destructive",
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
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e informações de contato
          </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) =>
                      setFormData({ ...formData, celular: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) =>
                    setFormData({ ...formData, dataNascimento: e.target.value })
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
                  {editingCliente ? "Salvar" : "Cadastrar"}
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
                        <p className="font-medium">{cliente.nome}</p>
                        <div className="flex gap-2 md:hidden text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.celular}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cliente.celular}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {cliente.email}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {formatDate(cliente.dataNascimento)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {cliente.cpf}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(cliente)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(cliente)}
                          >
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
    </div>
  );
}
