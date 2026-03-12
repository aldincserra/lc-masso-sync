import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Calendar } from "lucide-react";
import { Sessao } from "@/hooks/useSessoes";

interface SessoesListDialogProps {
  title: string;
  sessoes: Sessao[];
  isOpen: boolean;
  onClose: () => void;
  onSessaoClick?: (sessao: Sessao) => void;
}

export function SessoesListDialog({ title, sessoes, isOpen, onClose, onSessaoClick }: SessoesListDialogProps) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {sessoes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma sessão encontrada</p>
          ) : (
            sessoes.map((s) => (
              <button
                key={s.id}
                onClick={() => onSessaoClick?.(s)}
                className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground">{formatDate(s.data_sessao)}</p>
                    <p className="text-sm font-bold text-primary">{s.horario?.slice(0, 5) || "-"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.cliente?.nome || "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">{s.tipo_servico || "Serviço"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.valor && (
                    <span className="text-xs font-medium text-success">
                      R$ {s.valor.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <Badge
                    variant="secondary"
                    className={
                      s.status === "realizada"
                        ? "bg-success/20 text-success text-xs"
                        : s.status === "cancelada"
                        ? "bg-destructive/20 text-destructive text-xs"
                        : "bg-primary/20 text-primary text-xs"
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ReceitaDetailDialogProps {
  sessoes: Sessao[];
  receitaTotal: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceitaDetailDialog({ sessoes, receitaTotal, isOpen, onClose }: ReceitaDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Receita Mensal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm text-muted-foreground">Total do mês</p>
            <p className="text-2xl font-bold text-success">
              R$ {receitaTotal.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="space-y-2">
            {sessoes.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{s.cliente?.nome || "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">{s.tipo_servico} • {new Date(s.data_sessao).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className="font-bold text-success text-sm">
                  R$ {(s.valor || 0).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
