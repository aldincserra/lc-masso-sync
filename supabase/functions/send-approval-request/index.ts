import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const ADMIN_EMAIL = "aldinserra@yahoo.com.br";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  email: string;
  nome: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, userId }: ApprovalRequest = await req.json();

    console.log(`Nova solicitação de acesso: ${nome} (${email}) - User ID: ${userId}`);

    const { data, error } = await resend.emails.send({
      from: "Gestão de Atendimentos <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🔔 Nova solicitação de acesso: ${nome}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; margin-bottom: 12px; }
            .info-label { font-weight: 600; color: #6b7280; width: 80px; }
            .info-value { color: #1f2937; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .cta { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nova Solicitação de Acesso</h1>
            </div>
            <div class="content">
              <p>Uma nova pessoa solicitou acesso ao sistema:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Nome:</span>
                  <span class="info-value">${nome || "Não informado"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${email}</span>
                </div>
              </div>
              <p>Acesse o painel de administração para aprovar ou rejeitar esta solicitação.</p>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático do sistema de gestão.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      throw new Error(error.message);
    }

    console.log("E-mail enviado com sucesso:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "E-mail de notificação enviado com sucesso",
        emailId: data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Erro ao processar solicitação:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
