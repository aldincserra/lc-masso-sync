import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Eye, EyeOff, Loader2, Clock } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check if user is approved
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('aprovado')
          .eq('id', data.user?.id)
          .single();

        if (profileError) {
          // Profile might not exist yet (first login after signup)
          toast({
            title: "Aguardando aprovação",
            description: "Sua conta está aguardando aprovação do administrador.",
          });
          await supabase.auth.signOut();
          setPendingApproval(true);
          return;
        }

        if (!profile?.aprovado) {
          toast({
            title: "Aguardando aprovação",
            description: "Sua conta está aguardando aprovação do administrador.",
          });
          await supabase.auth.signOut();
          setPendingApproval(true);
          return;
        }

        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              nome: nome,
            },
          },
        });
        if (error) throw error;

        // Send approval request email
        try {
          await supabase.functions.invoke('send-approval-request', {
            body: {
              email,
              nome,
              userId: data.user?.id,
            },
          });
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }

        toast({
          title: "Conta criada!",
          description: "Sua solicitação foi enviada. Aguarde aprovação do administrador.",
        });
        setPendingApproval(true);
        setIsLogin(true);
      }
    } catch (error: any) {
      let message = "Ocorreu um erro. Tente novamente.";
      if (error.message?.includes("Invalid login")) {
        message = "E-mail ou senha incorretos.";
      } else if (error.message?.includes("already registered")) {
        message = "Este e-mail já está cadastrado.";
      }
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-soft p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="bg-card rounded-2xl shadow-brand-lg p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-warning/10">
                <Clock className="h-12 w-12 text-warning" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Aguardando Aprovação
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Sua solicitação de acesso foi enviada para o administrador.
                Você receberá uma notificação quando sua conta for aprovada.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPendingApproval(false);
                setIsLogin(true);
              }}
            >
              Voltar ao Login
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            LC Massoterapia © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-soft p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-brand-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {isLogin ? "Bem-vinda de volta!" : "Criar conta"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin
                ? "Entre para gerenciar sua clínica"
                : "Crie sua conta para começar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={!isLogin}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Aguarde...
                </>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Solicitar Acesso"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isLogin
                ? "Não tem conta? Solicitar acesso"
                : "Já tem conta? Fazer login"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          LC Massoterapia © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
