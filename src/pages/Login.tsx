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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) {
                toast({
                  title: "Erro",
                  description: "Erro ao entrar com Google. Tente novamente.",
                  variant: "destructive",
                });
              }
            }}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </Button>

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
