import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ApprovalRequest {
  userId: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
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

    const authenticatedUserId = claimsData.claims.sub;

    const { userId }: ApprovalRequest = await req.json();

    // Validate inputs
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure the authenticated user matches the requested userId
    if (authenticatedUserId !== userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden: userId mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: check if a pending registration already exists for this user
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch verified user data from auth instead of trusting request body
    const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(authenticatedUserId);
    if (authUserError || !authUser?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const email = authUser.user.email || "";
    const nome = authUser.user.user_metadata?.nome || "";

    const { data: existing } = await adminClient
      .from("pending_registrations")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pendente")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Solicitação já registrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Time-based rate limit: max 10 pending registrations in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await adminClient
      .from("pending_registrations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneHourAgo)
      .eq("status", "pendente");

    if (recentCount !== null && recentCount >= 10) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate that the userId corresponds to an actual profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (!adminEmail) {
      console.error("ADMIN_EMAIL secret not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Nova solicitação de acesso: ${nome} (${email}) - User ID: ${userId}`);

    const { data, error } = await resend.emails.send({
      from: "Gestão de Atendimentos <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🔔 Nova solicitação de acesso: ${escapeHtml(nome || "Não informado")}`,
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
                  <span class="info-value">${escapeHtml(nome || "Não informado")}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${escapeHtml(email)}</span>
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
