import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

    if (email.trim().toLowerCase() === ADMIN_EMAIL?.trim().toLowerCase() && password.trim() === ADMIN_PASSWORD?.trim()) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin')
    } else {
      setError('Invalid credentials. Check your .env configuration.')
      setLoading(false)
    }
  }

  const inputWrap = { position: 'relative', display: 'flex', alignItems: 'center' }
  const inputStyle = {
    width: '100%', padding: '0.9rem 1rem 0.9rem 3rem',
    border: '1.5px solid #e2e8f0', borderRadius: '0.75rem',
    fontSize: '0.9rem', fontFamily: 'inherit',
    background: '#f8fafc', color: '#0f172a', outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }
  const iconStyle = { position: 'absolute', left: '1rem', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 40% 30%, #161620 0%, #0a0a0b 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blob */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo Block */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
            style={{
              width: 64, height: 64,
              background: '#ef4444',
              borderRadius: '1.125rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 12px 40px rgba(239,68,68,0.35)',
            }}
          >
            <Shield size={30} color="#fff" />
          </motion.div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
            Admin <span style={{ color: '#ef4444' }}>Portal</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Secure access — AttkissonAutos Staff Only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '1.25rem',
          padding: window.innerWidth < 640 ? '1.5rem' : '2.25rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Error Banner */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Email Address
              </label>
              <div style={inputWrap}>
                <Mail size={16} style={iconStyle} />
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@attkissonautos.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Password
              </label>
              <div style={inputWrap}>
                <Lock size={16} style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '1rem',
                background: loading ? '#f87171' : '#ef4444',
                color: '#fff', border: 'none', borderRadius: '0.75rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
                transition: 'background 0.2s',
                marginTop: '0.25rem',
              }}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  Authenticating…
                </>
              ) : (
                <>Secure Login <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', marginBottom: '0.75rem' }}>
            Protected by Supabase Auth
          </p>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
