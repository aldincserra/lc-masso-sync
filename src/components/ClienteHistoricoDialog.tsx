import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, DollarSign, Package } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";
import { Sessao } from "@/hooks/useSessoes";

interface ClienteHistoricoDialogProps {
  cliente: Cliente | null;
  sessoes: Sessao[];
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteHistoricoDialog({
  cliente,
  sessoes,
  isOpen,
  onClose,
}: ClienteHistoricoDialogProps) {
  if (!cliente) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "realizada":
        return <Badge className="bg-success/20 text-success">Realizada</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Agendada</Badge>;
    }
  };

  const totalGasto = sessoes
    .filter(s => s.status === "realizada" && s.valor)
    .reduce((acc, s) => acc + (s.valor || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Histórico de {cliente.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total de Sessões</p>
              <p className="text-2xl font-bold text-foreground">{sessoes.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold text-primary">
                R$ {totalGasto.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Lista de Sessões */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {sessoes.length > 0 ? (
                sessoes.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(sessao.data_sessao)}
                        {sessao.horario && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            {formatTime(sessao.horario)}
                          </>
                        )}
                      </div>
                      {getStatusBadge(sessao.status)}
                    </div>
                    
                    <p className="font-medium text-foreground">
                      {sessao.tipo_servico || "Serviço não especificado"}
                    </p>
                    
                    {sessao.valor && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-primary">
                        <DollarSign className="h-4 w-4" />
                        R$ {sessao.valor.toFixed(2).replace(".", ",")}
                      </div>
                    )}
                    
                    {sessao.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {sessao.observacoes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma sessão encontrada</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
