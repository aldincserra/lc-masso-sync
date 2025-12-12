import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_EMAIL = "aldinserra@yahoo.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, userId } = await req.json();

    console.log(`Nova solicitação de acesso: ${nome} (${email}) - User ID: ${userId}`);
    console.log(`Notificação seria enviada para: ${ADMIN_EMAIL}`);

    // Por enquanto, apenas logamos a solicitação
    // Para envio real de e-mail, seria necessário integrar com um serviço como Resend ou SendGrid

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Solicitação de aprovação registrada com sucesso" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
