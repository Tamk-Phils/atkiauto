
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, name, email, phone, message, car_name, income, details } = payload
    console.log(`Processing ${type} notification for ${name}`)

    // SMTP Configuration from ENV
    const host = Deno.env.get("SMTP_HOST") || "mail.spacemail.com"
    const port = parseInt(Deno.env.get("SMTP_PORT") || "465")
    const username = Deno.env.get("SMTP_USERNAME") || "support@attkissonautos.com"
    const password = Deno.env.get("SMTP_PASSWORD") || "Phl$7872"

    console.log(`Connecting to SMTP: ${host}:${port} as ${username}`)

    const client = new SmtpClient();

    try {
      if (port === 465) {
        // Port 465 requires SSL/TLS from the start
        await client.connectTLS({
          hostname: host,
          port: port,
          username: username,
          password: password,
        });
      } else {
        // Port 587 usually uses STARTTLS
        await client.connect({
          hostname: host,
          port: port,
          username: username,
          password: password,
        });
      }
    } catch (connErr) {
      console.error("SMTP Connection Error:", connErr)
      throw new Error(`Failed to connect to mail server: ${connErr.message}`)
    }

    let subject = `[Attkisson Autos] New ${type || 'Notification'}`
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; }
            .content { padding: 40px; }
            .field { margin-bottom: 20px; }
            .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; color: #0f172a; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            hr { border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.02em;">New ${type || 'Notification'}</h1>
              <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Attkisson Autos Dealership Portal</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Customer Name</div>
                <div class="value">${name || 'Anonymous Guest'}</div>
              </div>
              <div class="field">
                <div class="label">Contact Info</div>
                <div class="value">${email || 'No email provided'} | ${phone || 'No phone'}</div>
              </div>
              
              <hr />
              
              ${car_name ? `
                <div class="field">
                  <div class="label">Interested Vehicle</div>
                  <div class="value" style="color: #ef4444;">${car_name}</div>
                </div>
              ` : ''}
              
              ${income ? `
                <div class="field">
                  <div class="label">Monthly Income</div>
                  <div class="value">$${income}</div>
                </div>
              ` : ''}
              
              ${message ? `
                <div class="field">
                  <div class="label">Message</div>
                  <div class="value" style="white-space: pre-wrap;">${message}</div>
                </div>
              ` : ''}

              ${details ? `
                <hr />
                <div class="field">
                  <div class="label">System Metadata</div>
                  <div class="value" style="font-family: monospace; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 6px;">${details}</div>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              Sent via Attkisson Autos Direct SMTP System
            </div>
          </div>
        </body>
      </html>
    `

    await client.send({
      from: username,
      to: username,
      subject: subject,
      content: htmlBody,
      html: htmlBody
    });

    console.log("Email sent successfully!")

    await client.close();

    return new Response(JSON.stringify({ success: true, message: "Email triggered successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
