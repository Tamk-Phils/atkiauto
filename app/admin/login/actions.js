"use server"

export async function adminLoginAction(email, password) {
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // Log on server for verification (scrubbed)
  console.log('[Auth] Login attempt for:', email);
  console.log('[Auth] Pass Length Match:', password.length === (ADMIN_PASSWORD?.length || 0));

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
