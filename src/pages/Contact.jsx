import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { notifyNewLead } from '../lib/emailService'

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

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
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
    const { error } = await supabase.from('leads').insert([{ ...formData, type: 'contact' }])
    if (error) { setStatus('error') } else {
      setStatus('success')
      // Send email notification
      notifyNewLead({ ...formData, type: 'contact' }).catch(err => console.error('Email notify failed:', err))
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    }
  }

  const contactInfo = [
    { icon: <Mail size={20} />, label: 'Email Us', value: 'support@attkissonautos.com' },
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

          {/* Left */}
          <div>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Get In Touch
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Connect With Us
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.75, marginBottom: '3rem', maxWidth: '420px' }}>
              Our dedicated advisors are ready to assist you with any inquiries about our inventory or financing.
            </p>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
              {contactInfo.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: 52, height: 52, flexShrink: 0,
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: '0.875rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>{item.label}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0a0a0b' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.875rem' }}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 44, height: 44, borderRadius: '0.625rem',
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <Icon size={18} />
                </a>
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
            <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Send a Message</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input required type="text" placeholder="John Smith" style={inputStyle}
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input required type="email" placeholder="john@example.com" style={inputStyle}
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                    <option>General Inquiry</option>
                    <option>Vehicle Availability</option>
                    <option>Feedback</option>
                    <option>Press Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea required placeholder="How can we help you today?" style={{ ...inputStyle, height: '140px', resize: 'none' }}
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
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'background 0.2s',
              }}>
                {status === 'loading' ? 'Sending...' : (<>Send Message <Send size={16} /></>)}
              </button>

              {status === 'success' && (
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  ✓ Message Sent! We'll get back to you shortly.
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

export default Contact
