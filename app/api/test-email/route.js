import { NextResponse } from 'next/server';
import { serverEmailService } from '@/lib/server/emailService';

export async function GET() {
    try {
        console.log('[Test-Email] Starting SMTP connection test...');
        const transporter = serverEmailService.getTransporter();
        
        // Detailed check
        await transporter.verify();
        
        return NextResponse.json({ 
            success: true, 
            message: 'SMTP Connection Verified Successfully',
            config: {
                host: transporter.options.host,
                port: transporter.options.port,
                secure: transporter.options.secure,
                user: transporter.options.auth.user,
                // Do not return password
            }
        });
    } catch (error) {
        console.error('[Test-Email] Verification failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        }, { status: 500 });
    }
}
