import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST || 'mail.spacemail.com';
      const user = process.env.SMTP_USER || 'support@attkissonautos.com';
      
      // Decode Base64 password from env
      const pass = process.env.SMTP_PASS_B64 ? 
        Buffer.from(process.env.SMTP_PASS_B64, 'base64').toString() : 
        'Phil$7872';
      
      console.log(`[EmailService] Initializing: Host=${host}, User=${user}, PassLength=${pass.length}, PassPattern=${pass.substring(0,2)}...${pass.substring(pass.length-2)}`);

      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user,
          pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    }
    return this.transporter;
  }

  async sendEmail({ type, name, email, phone, car_name, income, message, details }) {
    try {
        const transporter = this.getTransporter();
        // 1. Verify connection first
        await transporter.verify();
        
        // 2. Construct Email Content
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000000; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #ef4444; padding: 24px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Attkisson Autos</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px; font-weight: 700;">${type || 'New Lead Alert'}</p>
            </div>
            
            <div style="padding: 32px; background: #fff;">
              <h2 style="font-size: 20px; font-weight: 900; margin-top: 0; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; color: #000000;">Customer Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase;">Full Name</td>
                  <td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #000000;">${name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase;">Email Address</td>
                  <td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #000000;">${email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase;">Phone Number</td>
                  <td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #000000;">${phone || 'N/A'}</td>
                </tr>
                ${car_name ? `
                <tr>
                  <td style="padding: 10px 0; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase;">Vehicle</td>
                  <td style="padding: 10px 0; font-weight: 900; font-size: 16px; color: #ef4444;">${car_name}</td>
                </tr>` : ''}
                ${income ? `
                <tr>
                  <td style="padding: 10px 0; color: #000000; font-size: 11px; font-weight: 900; text-transform: uppercase;">Monthly Income</td>
                  <td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #000000;">$${parseInt(income).toLocaleString()}</td>
                </tr>` : ''}
              </table>
  
              ${message ? `
              <div style="margin-top: 32px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #000000; font-style: italic;">"${message}"</p>
              </div>` : ''}
  
              ${details ? `
              <div style="margin-top: 24px;">
                <p style="color: #000000; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Technical Details</p>
                <pre style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; color: #334155;">${details}</pre>
              </div>` : ''}
            </div>
            
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">This is an automated notification from the Attkisson Autos Portal.</p>
            </div>
          </div>
        `;
  
        // 3. Send Mail
        await transporter.sendMail({
          from: `"Attkisson Autos Alert" <${process.env.SMTP_USER || 'support@attkissonautos.com'}>`,
          to: 'support@attkissonautos.com',
          replyTo: email || 'support@attkissonautos.com',
          subject: `${type || 'New Lead'}: ${name || 'Inquiry'}`,
          html: emailHtml,
          text: `${type}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
        });

      return { success: true };
    } catch (error) {
      const errorContext = {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      };
      console.error('Email Service Detailed Error:', JSON.stringify(errorContext, null, 2));
      throw error;
    }
  }
}

export const serverEmailService = new EmailService();
