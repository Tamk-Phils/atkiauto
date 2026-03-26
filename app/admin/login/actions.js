"use server"

export async function adminLoginAction(email, password) {
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  // Decode Base64 password from env
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD_B64 ? 
    Buffer.from(process.env.ADMIN_PASSWORD_B64, 'base64').toString() : 
    'Phil$7872';

  if (email.trim().toLowerCase() === ADMIN_EMAIL?.trim().toLowerCase() && password.trim() === ADMIN_PASSWORD?.trim()) {
    return { success: true };
  }

  return { 
    success: false, 
    error: 'Invalid credentials',
    debug: {
        expectedLength: ADMIN_PASSWORD?.length,
        receivedLength: password.length
    }
  };
}
