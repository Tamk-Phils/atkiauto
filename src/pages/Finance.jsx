import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, PieChart, TrendingUp, ShieldCheck, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

const inputStyle = {
  width: '100%', padding: '0.875rem 1rem',
  border: '1.5px solid #e2e8f0', borderRadius: '0.625rem',
  fontSize: '0.875rem', fontFamily: 'inherit',
  background: '#fff', color: '#0f172a', outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block', fontSize: '0.65rem', fontWeight: 800,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  color: '#94a3b8', marginBottom: '0.5rem',
}

const Finance = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', income: '', message: '' })
  const [status, setStatus] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    const { error } = await supabase.from('leads').insert([{ ...formData, type: 'finance' }])
    if (error) { setStatus('error') } else {
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', income: '', message: '' })
    }
  }

  const features = [
    { icon: <PieChart size={22} />, title: 'Flexible Terms', desc: 'Up to 84 months customized to your financial profile.' },
    { icon: <TrendingUp size={22} />, title: 'Competitive Rates', desc: 'Industry-leading interest rates starting from 3.9% APR.' },
    { icon: <ShieldCheck size={22} />, title: 'Secure Process', desc: 'Your data is encrypted and handled with utmost privacy.' },
  ]

  return (
    <div style={{ paddingTop: isMobile ? '6rem' : '7rem', paddingBottom: '5rem', minHeight: '100vh', background: '#f8fafc', color: '#0a0a0b' }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? '4rem' : '5rem', 
          alignItems: 'start' 
        }}>

          {/* Left: Info */}
          <div>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Finance Department
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Easy Financing
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.75, marginBottom: '3rem', maxWidth: '480px' }}>
              Our financial experts work with a network of reputable lenders to provide you with the most competitive rates and flexible terms available.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {features.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 52, height: 52, flexShrink: 0,
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '0.75rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '0.375rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '1.25rem', 
              padding: isMobile ? '1.5rem' : '2.5rem' 
            }}
          >
            <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Apply for Credit</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input required type="text" placeholder="John Doe" style={inputStyle}
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input required type="email" placeholder="john@example.com" style={inputStyle}
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" style={inputStyle}
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Income (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="number" placeholder="5,000" style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                      value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#ef4444'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Additional Information</label>
                <textarea placeholder="Tell us about your trade-in or specific requirements..."
                  style={{ ...inputStyle, height: '110px', resize: 'none' }}
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <button disabled={status === 'loading'} style={{
                width: '100%', padding: '1rem',
                background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '0.625rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
                opacity: status === 'loading' ? 0.7 : 1,
              }}>
                {status === 'loading' ? 'Processing...' : (<>Submit Application <Send size={16} /></>)}
              </button>

              {status === 'success' && (
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  ✓ Success! A representative will contact you shortly.
                </div>
              )}
              {status === 'error' && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  Something went wrong. Please try again.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Finance
