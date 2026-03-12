import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ApprovalConfirmationRequest {
  email: string;
  nome: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role using service role client
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, nome }: ApprovalConfirmationRequest = await req.json();

    console.log(`Enviando confirmação de aprovação para: ${nome} (${email})`);

    const { data, error } = await resend.emails.send({
      from: "Gestão de Atendimentos <onboarding@resend.dev>",
      to: [email],
      subject: "✅ Sua conta foi aprovada!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .welcome-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 24px; margin: 20px 0; text-align: center; border: 1px solid #86efac; }
            .welcome-box h2 { color: #166534; margin: 0 0 10px; }
            .welcome-box p { color: #15803d; margin: 0; }
            .features { margin: 24px 0; }
            .feature { display: flex; align-items: center; margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; }
            .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; font-size: 18px; }
            .feature-text { flex: 1; }
            .feature-text h3 { margin: 0 0 4px; color: #1f2937; font-size: 14px; }
            .feature-text p { margin: 0; color: #6b7280; font-size: 13px; }
            .cta-section { text-align: center; margin: 30px 0; }
            .cta { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Conta Aprovada!</h1>
              <p>Bem-vindo(a) ao sistema de gestão</p>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2>Olá, ${escapeHtml(nome || "Usuário")}! 🎉</h2>
                <p>Sua conta foi aprovada e você já pode acessar o sistema.</p>
              </div>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-icon">📅</div>
                  <div class="feature-text">
                    <h3>Agenda</h3>
                    <p>Gerencie seus agendamentos de forma simples</p>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <div class="feature-text">
                    <h3>Clientes</h3>
                    <p>Cadastre e acompanhe seus clientes</p>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">💰</div>
                  <div class="feature-text">
                    <h3>Pagamentos</h3>
                    <p>Controle financeiro completo</p>
                  </div>
                </div>
              </div>
              
              <div class="cta-section">
                <p style="color: #6b7280; margin-bottom: 16px;">Acesse agora e comece a usar:</p>
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}" class="cta">Acessar Sistema</a>
              </div>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático. Se tiver dúvidas, entre em contato.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail de confirmação:", error);
      throw new Error(error.message);
    }

    console.log("E-mail de confirmação enviado com sucesso:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "E-mail de confirmação enviado com sucesso",
        emailId: data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro na função send-approval-confirmation:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
