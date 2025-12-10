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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, Pencil, Trash2, Package } from "lucide-react";

interface Pacote {
  id: string;
  nome: string;
  descricao: string;
  sessoes: number;
  preco: number;
  validade: number; // em dias
  ativo: boolean;
}

const pacotesMock: Pacote[] = [
  {
    id: "1",
    nome: "Pacote Relaxante",
    descricao: "5 sessões de massagem relaxante",
    sessoes: 5,
    preco: 600.0,
    validade: 90,
    ativo: true,
  },
  {
    id: "2",
    nome: "Pacote Terapêutico",
    descricao: "10 sessões de massagem terapêutica",
    sessoes: 10,
    preco: 1100.0,
    validade: 180,
    ativo: true,
  },
  {
    id: "3",
    nome: "Pacote Drenagem",
    descricao: "8 sessões de drenagem linfática",
    sessoes: 8,
    preco: 800.0,
    validade: 120,
    ativo: true,
  },
];

export default function Pacotes() {
  const [pacotes, setPacotes] = useState<Pacote[]>(pacotesMock);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPacote, setEditingPacote] = useState<Pacote | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    sessoes: "",
    preco: "",
    validade: "",
  });

  const handleOpenDialog = (pacote?: Pacote) => {
    if (pacote) {
      setEditingPacote(pacote);
      setFormData({
        nome: pacote.nome,
        descricao: pacote.descricao,
        sessoes: pacote.sessoes.toString(),
        preco: pacote.preco.toString(),
        validade: pacote.validade.toString(),
      });
    } else {
      setEditingPacote(null);
      setFormData({
        nome: "",
        descricao: "",
        sessoes: "",
        preco: "",
        validade: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPacote) {
      setPacotes(
        pacotes.map((p) =>
          p.id === editingPacote.id
            ? {
                ...p,
                nome: formData.nome,
                descricao: formData.descricao,
                sessoes: parseInt(formData.sessoes),
                preco: parseFloat(formData.preco),
                validade: parseInt(formData.validade),
              }
            : p
        )
      );
      toast({
        title: "Pacote atualizado!",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });
    } else {
      const novoPacote: Pacote = {
        id: Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        sessoes: parseInt(formData.sessoes),
        preco: parseFloat(formData.preco),
        validade: parseInt(formData.validade),
        ativo: true,
      };
      setPacotes([...pacotes, novoPacote]);
      toast({
        title: "Pacote criado!",
        description: `${formData.nome} foi adicionado com sucesso.`,
      });
    }

    setIsDialogOpen(false);
    setEditingPacote(null);
  };

  const handleDelete = (pacote: Pacote) => {
    setPacotes(pacotes.filter((p) => p.id !== pacote.id));
    toast({
      title: "Pacote excluído",
      description: `${pacote.nome} foi removido.`,
      variant: "destructive",
    });
  };

  const handleToggleAtivo = (pacote: Pacote) => {
    setPacotes(
      pacotes.map((p) =>
        p.id === pacote.id ? { ...p, ativo: !p.ativo } : p
      )
    );
    toast({
      title: pacote.ativo ? "Pacote desativado" : "Pacote ativado",
      description: `${pacote.nome} foi ${
        pacote.ativo ? "desativado" : "ativado"
      }.`,
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Pacotes
          </h1>
          <p className="text-muted-foreground">
            Gerencie os pacotes de serviços
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingPacote ? "Editar Pacote" : "Novo Pacote"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Pacote</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessoes">Sessões</Label>
                  <Input
                    id="sessoes"
                    type="number"
                    min="1"
                    value={formData.sessoes}
                    onChange={(e) =>
                      setFormData({ ...formData, sessoes: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({ ...formData, preco: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validade">Validade (dias)</Label>
                  <Input
                    id="validade"
                    type="number"
                    min="1"
                    value={formData.validade}
                    onChange={(e) =>
                      setFormData({ ...formData, validade: e.target.value })
                    }
                    required
                  />
                </div>
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
                  {editingPacote ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pacotes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacotes.map((pacote) => (
          <Card
            key={pacote.id}
            className={`shadow-brand-sm hover:shadow-brand-md transition-all ${
              !pacote.ativo ? "opacity-60" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {pacote.nome}
                  </CardTitle>
                  <Badge
                    variant={pacote.ativo ? "default" : "secondary"}
                    className={
                      pacote.ativo
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {pacote.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenDialog(pacote)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleAtivo(pacote)}>
                    {pacote.ativo ? "Desativar" : "Ativar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(pacote)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{pacote.descricao}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {pacote.sessoes}
                  </p>
                  <p className="text-xs text-muted-foreground">sessões</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(pacote.preco)}
                  </p>
                  <p className="text-xs text-muted-foreground">valor total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {pacote.validade}
                  </p>
                  <p className="text-xs text-muted-foreground">dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pacotes.length === 0 && (
        <Card className="shadow-brand-sm">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum pacote cadastrado</p>
            <Button
              variant="brand"
              className="mt-4"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Pacote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
