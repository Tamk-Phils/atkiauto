
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
    const { type, name, email, phone, message, car_name, income, details } = await req.json()

    // SMTP Configuration from ENV
    const host = Deno.env.get("SMTP_HOST") || "smtp.spaceship.com"
    const port = parseInt(Deno.env.get("SMTP_PORT") || "587")
    const username = Deno.env.get("SMTP_USERNAME") || "support@attkissonautos.com"
    const password = Deno.env.get("SMTP_PASSWORD") || "Phl$7872"

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: host,
      port: port,
      username: username,
      password: password,
    });

    let subject = `[Attkisson Autos] New ${type || 'Inquiry'}`
    let body = `
      <h2>New ${type || 'Notification'}</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <hr />
    `

    if (car_name) body += `<p><strong>Interested In:</strong> ${car_name}</p>`
    if (income) body += `<p><strong>Monthly Income:</strong> $${income}</p>`
    if (message) body += `<p><strong>Message:</strong><br />${message.replace(/\n/g, '<br />')}</p>`
    if (details) body += `<p><strong>Additional Details:</strong><br /><pre>${details}</pre></p>`

    body += `<hr /><p>Sent from your Attkisson Autos portal.</p>`

    await client.send({
      from: username,
      to: username, // Send to self
      subject: subject,
      content: body,
      html: body
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
