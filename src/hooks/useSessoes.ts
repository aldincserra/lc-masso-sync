import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Sessao {
  id: string;
  user_id: string;
  cliente_id: string;
  pacote_id: string | null;
  data_sessao: string;
  horario: string | null;
  tipo_servico: string | null;
  valor: number | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: string;
    nome: string;
    celular: string | null;
    email: string | null;
  };
}

export interface SessaoFormData {
  cliente_id: string;
  data_sessao: string;
  horario: string;
  tipo_servico: string;
  valor: string;
  observacoes: string;
}

export function useSessoes() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessoes')
        .select(`
          *,
          cliente:clientes(id, nome, celular, email)
        `)
        .order('data_sessao', { ascending: true });

      if (error) throw error;
      setSessoes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar sessões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessoes();
  }, []);

  const addSessao = async (formData: SessaoFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sessoes')
        .insert({
          user_id: user.id,
          cliente_id: formData.cliente_id,
          data_sessao: formData.data_sessao,
          horario: formData.horario || null,
          tipo_servico: formData.tipo_servico || null,
          valor: formData.valor ? parseFloat(formData.valor) : null,
          observacoes: formData.observacoes || null,
          status: 'agendada',
        })
        .select(`
          *,
          cliente:clientes(id, nome, celular, email)
        `)
        .single();

      if (error) throw error;
      
      setSessoes([...sessoes, data]);
      toast({
        title: "Sessão agendada!",
        description: `Sessão para ${data.cliente?.nome} agendada com sucesso.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao agendar sessão.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSessaoStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('sessoes')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(id, nome, celular, email)
        `)
        .single();

      if (error) throw error;
      
      setSessoes(sessoes.map(s => s.id === id ? data : s));
      toast({
        title: "Status atualizado!",
        description: `Sessão marcada como ${status}.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSessao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sessoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSessoes(sessoes.filter(s => s.id !== id));
      toast({
        title: "Sessão excluída",
        description: "A sessão foi removida.",
        variant: "destructive",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir sessão.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getProximasSessoes = () => {
    const now = new Date();
    return sessoes
      .filter(s => new Date(s.data_sessao) >= now && s.status === 'agendada')
      .slice(0, 5);
  };

  const getSessoesCliente = (clienteId: string) => {
    return sessoes.filter(s => s.cliente_id === clienteId);
  };

  return {
    sessoes,
    loading,
    fetchSessoes,
    addSessao,
    updateSessaoStatus,
    deleteSessao,
    getProximasSessoes,
    getSessoesCliente,
  };
}
