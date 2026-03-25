// Automated Deployment Trigger - v11 (Clean Rewrite + Timeout)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Global 15-second timeout to prevent 502 hangs
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Global Function Timeout (15s)")), 15000)
  );

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Wrap the request handler in a race with the timeout
    const response = await Promise.race([
      handleRequest(req),
      timeoutPromise
    ]);
    return response as Response;
  } catch (err) {
    const error = err as Error;
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleRequest(req: Request): Promise<Response> {
  const payload = await req.json();
  const { type, name, email, phone, message, car_name, income, details } = payload;
  console.log(`Processing ${type} notification for ${name}`);

  const host = Deno.env.get("SMTP_HOST") || "mail.spacemail.com";
  const port = parseInt(Deno.env.get("SMTP_PORT") || "587");
  const username = Deno.env.get("SMTP_USERNAME") || "adminsupport@eliesbichon.com";
  const password = Deno.env.get("SMTP_PASSWORD");

  if (!password) {
    throw new Error("SMTP_PASSWORD not set in Edge Function secrets.");
  }

  console.log(`Connecting to SMTP: ${host}:${port} as ${username}`);

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port: port,
      tls: false, // Port 587/2525 use STARTTLS
      auth: {
        username: username,
        password: password,
      },
    },
  });

  try {
    await client.send({
      from: username,
      to: username,
      replyTo: email || username,
      subject: `[LEAD] ${type || 'Notification'} - ${name || 'Inquiry'}`,
      content: `New ${type} received from ${name}. Email: ${email}, Phone: ${phone}. Msg: ${message || 'No message'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; background: #fff;">
          <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">New ${type || 'Inquiry'}</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p><strong>Name:</strong> ${name || 'N/A'}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            ${car_name ? `<p><strong>Vehicle:</strong> ${car_name}</p>` : ''}
            ${income ? `<p><strong>Income:</strong> $${income}</p>` : ''}
            ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ''}
            ${details ? `<p style="font-size: 10px; color: #999;"><strong>Ref:</strong> ${details}</p>` : ''}
          </div>
          <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            Attkisson Autos Notification System
          </div>
        </div>
      `,
    });
    
    console.log("Email sent successfully!");
    await client.close();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (smtpErr) {
    const msg = (smtpErr as Error).message || String(smtpErr);
    console.error("SMTP Error:", msg);
    return new Response(JSON.stringify({ 
      error: `SMTP Failed: ${msg}`, 
      details: "If this says Timeout, check Port 587. If Auth, check password." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
