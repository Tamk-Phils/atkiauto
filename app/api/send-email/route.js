import { NextResponse } from 'next/server';
import { serverEmailService } from '@/lib/server/emailService';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Validate required fields
    const { name, email, message } = payload;
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, email)' },
        { status: 400 }
      );
    }

    // Use the robust server-side service
    const result = await serverEmailService.sendEmail(payload);

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email API Route Error:', error.message);
    
    // Return detailed error to help debugging
    return NextResponse.json(
      { 
        success: false, 
        error: 'SMTP Authentication or Connection Failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
