import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile check with setTimeout
        if (session?.user) {
          setTimeout(() => {
            checkApprovalStatus(session.user.id);
          }, 0);
        } else {
          setIsApproved(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkApprovalStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkApprovalStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('aprovado')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking approval status:', error);
        setIsApproved(false);
        return;
      }

      setIsApproved(data?.aprovado ?? false);
    } catch (error) {
      console.error('Error:', error);
      setIsApproved(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsApproved(null);
      navigate('/login');
      toast({
        title: "Sessão encerrada",
        description: "Você foi deslogado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    loading,
    isApproved,
    signOut,
    checkApprovalStatus,
  };
}
