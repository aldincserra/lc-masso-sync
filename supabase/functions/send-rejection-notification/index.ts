import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectionNotificationRequest {
  email: string;
  nome: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome }: RejectionNotificationRequest = await req.json();

    console.log(`Enviando notificação de rejeição para: ${nome} (${email})`);

    const { data, error } = await resend.emails.send({
      from: "Gestão de Atendimentos <onboarding@resend.dev>",
      to: [email],
      subject: "Sobre sua solicitação de acesso",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .message-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 24px; margin: 20px 0; text-align: center; border: 1px solid #fbbf24; }
            .message-box h2 { color: #92400e; margin: 0 0 10px; }
            .message-box p { color: #a16207; margin: 0; }
            .info-section { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .info-section p { color: #4b5563; margin: 0 0 12px; line-height: 1.6; }
            .info-section p:last-child { margin-bottom: 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Solicitação de Acesso</h1>
              <p>Atualização sobre seu cadastro</p>
            </div>
            <div class="content">
              <div class="message-box">
                <h2>Olá, ${nome || "Usuário"}!</h2>
                <p>Sua solicitação de acesso foi analisada.</p>
              </div>
              
              <div class="info-section">
                <p>Infelizmente, sua solicitação de acesso ao sistema não foi aprovada neste momento.</p>
                <p>Isso pode ocorrer por diversos motivos, como informações incompletas ou incompatibilidade com os critérios de uso da plataforma.</p>
                <p>Se você acredita que houve um erro ou deseja mais informações, entre em contato conosco para esclarecimentos.</p>
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
      console.error("Erro ao enviar e-mail de rejeição:", error);
      throw new Error(error.message);
    }

    console.log("E-mail de rejeição enviado com sucesso:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "E-mail de rejeição enviado com sucesso",
        emailId: data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro na função send-rejection-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
