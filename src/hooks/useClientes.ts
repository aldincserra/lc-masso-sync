import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  celular: string | null;
  email: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteFormData {
  nome: string;
  celular: string;
  email: string;
  data_nascimento: string;
  cpf: string;
  observacoes: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const addCliente = async (formData: ClienteFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          user_id: user.id,
          nome: formData.nome,
          celular: formData.celular || null,
          email: formData.email || null,
          data_nascimento: formData.data_nascimento || null,
          cpf: formData.cpf || null,
          observacoes: formData.observacoes || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setClientes([...clientes, data]);
      toast({
        title: "Cliente cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar cliente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCliente = async (id: string, formData: ClienteFormData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: formData.nome,
          celular: formData.celular || null,
          email: formData.email || null,
          data_nascimento: formData.data_nascimento || null,
          cpf: formData.cpf || null,
          observacoes: formData.observacoes || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setClientes(clientes.map(c => c.id === id ? data : c));
      toast({
        title: "Cliente atualizado!",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cliente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteCliente = async (id: string, nome: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClientes(clientes.filter(c => c.id !== id));
      toast({
        title: "Cliente excluído",
        description: `${nome} foi removido.`,
        variant: "destructive",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir cliente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    clientes,
    loading,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
  };
}
