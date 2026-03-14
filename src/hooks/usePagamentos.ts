import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pagamento {
  id: string;
  user_id: string;
  cliente_id: string;
  sessao_id: string | null;
  pacote_id: string | null;
  valor: number;
  data_pagamento: string;
  forma_pagamento: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  cliente?: {
    id: string;
    nome: string;
  };
  sessao?: {
    id: string;
    tipo_servico: string | null;
  } | null;
}

export interface PagamentoFormData {
  cliente_id: string;
  sessao_id?: string;
  valor: number;
  data_pagamento: string;
  forma_pagamento: string;
  status: string;
  descricao?: string;
}

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          cliente:clientes(id, nome),
          sessao:sessoes(id, tipo_servico)
        `)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;
      setPagamentos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const addPagamento = async (formData: PagamentoFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          user_id: user.id,
          cliente_id: formData.cliente_id,
          sessao_id: formData.sessao_id || null,
          valor: formData.valor,
          data_pagamento: formData.data_pagamento,
          forma_pagamento: formData.forma_pagamento || null,
          status: formData.status,
        })
        .select(`
          *,
          cliente:clientes(id, nome),
          sessao:sessoes(id, tipo_servico)
        `)
        .single();

      if (error) throw error;

      setPagamentos([data, ...pagamentos]);
      toast({
        title: "Lançamento registrado!",
        description: `R$ ${formData.valor.toFixed(2).replace('.', ',')}`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar pagamento.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    pagamentos,
    loading,
    fetchPagamentos,
    addPagamento,
  };
}
