// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DOMAIN = "secbm.org.br"; // Fixed domain as per user request

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, sender_email_prefix } = await req.json();

    if (!to || !subject || !html || !sender_email_prefix) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html, or sender_email_prefix" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const from = `${sender_email_prefix}@${DOMAIN}`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-email] Resend API Error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email via Resend", details: resendData }), {
        status: resendResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-email] Email sent successfully:", resendData);
    return new Response(JSON.stringify({ message: "Email sent successfully", data: resendData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[send-email] General Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
