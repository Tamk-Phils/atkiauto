// Automated Deployment Trigger - v6 (Denomailer Upgrade)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, name, email, phone, message, car_name, income, details } = payload
    console.log(`Processing ${type} notification for ${name}`)

    const host = Deno.env.get("SMTP_HOST") || "mail.spacemail.com"
    const port = parseInt(Deno.env.get("SMTP_PORT") || "587")
    const username = Deno.env.get("SMTP_USERNAME") || "adminsupport@eliesbichon.com"
    const password = Deno.env.get("SMTP_PASSWORD")

    if (!password) {
      throw new Error("SMTP_PASSWORD not set in Edge Function secrets.")
    }

    console.log(`Attempting SMTP connection to ${host}:${port} as ${username}`)

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: port === 465, // Use direct TLS for 465, STARTTLS for 587
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
        subject: `[Attkisson Autos] New ${type || 'Inquiry'}`,
        content: "Please view the HTML version of this message.",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">New ${type || 'Notification'}</h2>
            </div>
            <div style="padding: 20px;">
              <p><strong>Name:</strong> ${name || 'N/A'}</p>
              <p><strong>Email:</strong> ${email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              ${car_name ? `<p><strong>Vehicle:</strong> ${car_name}</p>` : ''}
              ${income ? `<p><strong>Income:</strong> $${income}</p>` : ''}
              ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ''}
              ${details ? `<p style="font-size: 10px; color: #999;"><strong>System Info:</strong> ${details}</p>` : ''}
            </div>
            <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              Sent via Attkisson Autos Portal (Direct SMTP)
            </div>
          </div>
        `,
      });
      
      console.log("Email sent successfully via Denomailer");
      await client.close();
    } catch (smtpErr) {
      const msg = (smtpErr as Error).message || String(smtpErr)
      console.error("SMTP Client Error:", msg);
      // Return the EXACT error to the frontend for diagnosis
      return new Response(JSON.stringify({ error: `SMTP Failed: ${msg}`, details: "If this says Timeout, Port 587 is blocked. If it says Auth, Password/User is wrong." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    const error = err as Error
    console.error("Edge Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
