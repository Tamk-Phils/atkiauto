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

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationEmail = Deno.env.get("SMTP_USERNAME") || "adminsupport@eliesbichon.com";

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not set. Please get a free key from resend.com");
  }

  console.log(`Sending via Resend API to ${notificationEmail}`);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Attkisson Autos <notifications@resend.dev>', // You can use this free domain for now
      to: [notificationEmail],
      reply_to: email || notificationEmail,
      subject: `[LEAD] ${type || 'Notification'} - ${name || 'Inquiry'}`,
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
            Attkisson Autos Notification System (Powered by Resend)
          </div>
        </div>
      `,
    }),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(`Resend Error: ${resData.message || JSON.stringify(resData)}`);
  }

  console.log("Email sent successfully via Resend!");
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
