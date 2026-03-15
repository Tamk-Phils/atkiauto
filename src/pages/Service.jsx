import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Clock, MapPin, Send } from 'lucide-react'
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

const services = ['General Maintenance', 'Oil & Filter Change', 'Brake Inspection', 'Engine Performance', 'Transmission Service', 'Tire Rotation & Balance']

const Service = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    service_type: 'General Maintenance',
    appointment_date: '', appointment_time: '09:00'
  })
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
    const { error } = await supabase.from('appointments').insert([formData])
    if (error) { setStatus('error') } else {
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', service_type: 'General Maintenance', appointment_date: '', appointment_time: '09:00' })
    }
  }

  return (
    <div style={{ paddingTop: isMobile ? '6rem' : '7rem', paddingBottom: '5rem', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '3rem' : '4rem' }}>
          <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Service Centre
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Precision Care
          </h1>
          <p style={{ color: '#64748b', maxWidth: '520px', margin: isMobile ? '0' : '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
            Maintain peak performance with certified technicians and state-of-the-art diagnostic equipment.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', 
          gap: '2.5rem', 
          alignItems: 'start' 
        }}>

          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hours */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Clock size={16} style={{ color: '#ef4444' }} /> Service Hours
              </h3>
              {[
                { day: 'Monday – Friday', hours: '08:00 – 18:00' },
                { day: 'Saturday',        hours: '09:00 – 16:00' },
                { day: 'Sunday',          hours: 'Closed',  red: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', fontSize: '0.825rem' }}>
                  <span style={{ color: '#64748b' }}>{row.day}</span>
                  <span style={{ fontWeight: 800, color: row.red ? '#ef4444' : '#0a0a0b' }}>{row.hours}</span>
                </div>
              ))}
            </div>

            {/* Location */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <MapPin size={16} style={{ color: '#ef4444' }} /> Location
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.75 }}>
                123 Automotive Way<br />Luxury District, Metropolis<br />MT 54321
              </p>
              <button style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: 0 }}>
                Get Directions →
              </button>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '1.25rem', 
              padding: isMobile ? '1.5rem' : '2.5rem' 
            }}
          >
            <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Schedule Appointment</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem' 
              }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input required type="text" style={inputStyle} value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input required type="email" style={inputStyle} value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                  <label style={labelStyle}>Service Type</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.service_type}
                    onChange={e => setFormData({ ...formData, service_type: e.target.value })}>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" style={inputStyle} value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                  <label style={labelStyle}>Preferred Date</label>
                  <input required type="date" style={inputStyle} value={formData.appointment_date}
                    onChange={e => setFormData({ ...formData, appointment_date: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Preferred Time</label>
                  <input required type="time" style={inputStyle} value={formData.appointment_time}
                    onChange={e => setFormData({ ...formData, appointment_time: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <button disabled={status === 'loading'} style={{
                width: '100%', padding: '1rem',
                background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '0.625rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: status === 'loading' ? 0.7 : 1,
              }}>
                {status === 'loading' ? 'Scheduling...' : (<>Confirm Appointment <Wrench size={16} /></>)}
              </button>

              {status === 'success' && (
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '0.625rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  ✓ Appointment Requested! We will confirm by email.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Service
