import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, DollarSign, FileText, Loader2 } from "lucide-react";
import { Sessao } from "@/hooks/useSessoes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SessaoDetailDialogProps {
  sessao: Sessao | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (sessao: Sessao) => void;
}

export function SessaoDetailDialog({ sessao, isOpen, onClose, onStatusUpdate }: SessaoDetailDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState("");
  const { toast } = useToast();

  if (!sessao) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const handleDarBaixa = async () => {
    if (!formaPagamento) {
      toast({ title: "Selecione a forma de pagamento", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Create payment record
      const { error: pagError } = await supabase.from("pagamentos").insert({
        user_id: user.id,
        cliente_id: sessao.cliente_id,
        sessao_id: sessao.id,
        valor: sessao.valor || 0,
        data_pagamento: new Date().toISOString().split("T")[0],
        forma_pagamento: formaPagamento,
        status: "pago",
      });
      if (pagError) throw pagError;

      // Update session status
      const { data, error: sessError } = await supabase
        .from("sessoes")
        .update({ status: "realizada" })
        .eq("id", sessao.id)
        .select(`*, cliente:clientes(id, nome, celular, email)`)
        .single();
      if (sessError) throw sessError;

      toast({ title: "Pagamento registrado!", description: `Sessão marcada como realizada.` });
      onStatusUpdate?.(data);
      onClose();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from("sessoes")
        .update({ status: newStatus })
        .eq("id", sessao.id)
        .select(`*, cliente:clientes(id, nome, celular, email)`)
        .single();
      if (error) throw error;

      toast({ title: "Status atualizado!", description: `Sessão marcada como ${newStatus}.` });
      onStatusUpdate?.(data);
      onClose();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const statusColor = sessao.status === "realizada"
    ? "bg-success/20 text-success"
    : sessao.status === "cancelada"
    ? "bg-destructive/20 text-destructive"
    : "bg-primary/20 text-primary";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Detalhes da Sessão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColor}>{sessao.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{sessao.cliente?.nome || "Cliente"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(sessao.data_sessao)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{sessao.horario?.slice(0, 5) || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>R$ {(sessao.valor || 0).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{sessao.tipo_servico || "Serviço não especificado"}</span>
          </div>

          {sessao.observacoes && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              {sessao.observacoes}
            </p>
          )}

          {sessao.status === "agendada" && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Dar baixa no pagamento</h4>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
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
              <div className="flex gap-2">
                <Button
                  variant="brand"
                  className="flex-1"
                  onClick={handleDarBaixa}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Pagamento"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus("cancelada")}
                  disabled={processing}
                  className="text-destructive"
                >
                  Cancelar Sessão
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
