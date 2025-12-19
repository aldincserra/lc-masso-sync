import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  nome: string | null;
  status: string;
  created_at: string;
}

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (roles && roles.length > 0) {
        setIsAdmin(true);
        await loadPendingUsers();
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    const { data, error } = await supabase
      .from("pending_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading pending users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários pendentes",
        variant: "destructive",
      });
    } else {
      setPendingUsers(data || []);
    }
  };

  const handleApprove = async (pendingUser: PendingUser) => {
    setProcessing(pendingUser.id);
    try {
      // Update profile to approved
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ aprovado: true })
        .eq("id", pendingUser.user_id);

      if (profileError) throw profileError;

      // Update pending registration status
      const { error: pendingError } = await supabase
        .from("pending_registrations")
        .update({ status: "aprovado" })
        .eq("id", pendingUser.id);

      if (pendingError) throw pendingError;

      // Send approval confirmation email to user
      try {
        await supabase.functions.invoke("send-approval-confirmation", {
          body: {
            email: pendingUser.email,
            nome: pendingUser.nome,
          },
        });
        console.log("E-mail de confirmação enviado para:", pendingUser.email);
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de confirmação:", emailError);
        // Don't fail the approval if email fails
      }

      toast({
        title: "Usuário aprovado",
        description: `${pendingUser.nome || pendingUser.email} foi aprovado e notificado por e-mail`,
      });

      await loadPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (pendingUser: PendingUser) => {
    setProcessing(pendingUser.id);
    try {
      // Update pending registration status
      const { error: pendingError } = await supabase
        .from("pending_registrations")
        .update({ status: "rejeitado" })
        .eq("id", pendingUser.id);

      if (pendingError) throw pendingError;

      toast({
        title: "Usuário rejeitado",
        description: `${pendingUser.nome || pendingUser.email} foi rejeitado`,
      });

      await loadPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o usuário",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case "aprovado":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><Check className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><X className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const pendingCount = pendingUsers.filter(u => u.status === "pendente").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administração</h1>
        <p className="text-muted-foreground">Gerencie usuários pendentes de aprovação</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprovados</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {pendingUsers.filter(u => u.status === "aprovado").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejeitados</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {pendingUsers.filter(u => u.status === "rejeitado").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Acesso</CardTitle>
          <CardDescription>
            Lista de usuários que solicitaram acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação de acesso encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      {user.status === "pendente" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-500/10"
                            onClick={() => handleApprove(user)}
                            disabled={processing === user.id}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-500/10"
                            onClick={() => handleReject(user)}
                            disabled={processing === user.id}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
