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
      sessionStorage.setItem('admin_auth', 'true')
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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_80%_60%_at_40%_30%,#161620_0%,#0a0a0b_100%)] p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(239,68,68,0.07)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(239,68,68,0.04)_0%,transparent_65%)] pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_30%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-10"
        style={{ maxWidth: '380px' }}
      >
        {/* Logo Block */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
            className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner"
          >
            <Shield className="text-primary" size={20} />
          </motion.div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 uppercase italic">
            Admin<span className="text-primary not-italic">Portal</span>
          </h1>
          <p className="text-white/40 text-[13px] font-medium uppercase tracking-widest">
            Secure access — Staff Only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-white/10">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Error Banner */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Email Address
              </label>
              <div className="relative flex items-center group">
                <Mail size={18} className="absolute left-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@attkissonautos.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Password
              </label>
              <div className="relative flex items-center group">
                <Lock size={18} className="absolute left-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-12 text-sm font-bold text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_12px_32px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Secure Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">
            Protected by Supabase Auth
          </p>
          <Link to="/" className="text-white/40 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            ← Back to Site
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
