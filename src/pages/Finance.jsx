import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, PieChart, TrendingUp, ShieldCheck, Send, Search, ChevronDown, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { notifyNewLead } from '../lib/emailService'
import emailjs from '@emailjs/browser'

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
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', income: '', message: '', car_id: '',
    dob: '', address: '', city: '', state: '', zip: '', duration_at_address: '', prev_address: '',
    dl_number: '', dl_state: '', dl_expiry: '',
    ref_name: '', ref_phone: '', ref_relationship: '',
    authorized: false
  })
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [status, setStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    
    const fetchCars = async () => {
      const { data } = await supabase.from('cars').select('id, make, model, year, reservation_fee, down_payment').eq('status', 'available')
      if (data) setCars(data)
    }
    fetchCars()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCarChange = (id) => {
    const car = cars.find(c => c.id === id)
    setSelectedCar(car)
    setFormData({ ...formData, car_id: id })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.authorized) {
      alert("Please authorize the application to proceed.")
      return
    }
    setStatus('loading')

    const { 
      name, email, phone, income, message, car_id, down_payment,
      ...additionalData 
    } = formData

    let { error } = await supabase.from('leads').insert([{ 
      name, 
      email, 
      phone, 
      income, 
      message, 
      car_id: car_id || null, 
      type: 'finance',
      data: additionalData
    }])

    if (error && error.code === 'PGRST204') {
      // Fallback: Combine data into message if 'data' column is missing
      const combinedMessage = `[FINANCING DETAILS]\n${Object.entries(additionalData).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n')}\n\n[USER MESSAGE]\n${message}`
      const fallbackResponse = await supabase.from('leads').insert([{ 
        name, email, phone, income, message: combinedMessage, car_id: car_id || null, type: 'finance'
      }])
      error = fallbackResponse.error
    }
    if (error) { 
      console.error(error)
      setStatus('error') 
    } else {
      setStatus('success')
      setFormData({ 
        name: '', email: '', phone: '', income: '', message: '', car_id: '',
        dob: '', address: '', city: '', state: '', zip: '', duration_at_address: '', prev_address: '',
        dl_number: '', dl_state: '', dl_expiry: '',
        ref_name: '', ref_phone: '', ref_relationship: '',
        authorized: false
      })
      setSelectedCar(null)
      
      // Email Notification to Admin
      try {
        await notifyNewLead({
          name,
          email,
          phone,
          income,
          car_name: selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : 'Generic Inquiry',
          message: message,
          type: 'Financing Application',
          additionalData: additionalData
        })
      } catch (err) {
        console.error('Email notification failed:', err)
      }
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
            <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em', marginBottom: '2rem' }}>Apply for Financing</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={labelStyle}>Select Vehicle (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ ...inputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ color: selectedCar ? '#0f172a' : '#94a3b8' }}>
                      {selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : 'Search or choose a car...'}
                    </span>
                    <ChevronDown size={18} style={{ color: '#94a3b8' }} />
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute', top: '105%', left: 0, right: 0,
                          background: '#fff', border: '1.5px solid #e2e8f0',
                          borderRadius: '0.625rem', zIndex: 50,
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          maxHeight: '280px', overflowY: 'auto', padding: '0.5rem'
                        }}
                      >
                        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            type="text" 
                            placeholder="Type to filter..."
                            style={{ ...inputStyle, padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.8rem' }}
                            value={searchTerm}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div 
                            onClick={() => { handleCarChange(null); setIsOpen(false); setSearchTerm(''); }}
                            style={{ 
                              padding: '0.75rem', borderRadius: '0.375rem', cursor: 'pointer',
                              fontSize: '0.875rem', color: '#64748b', transition: 'background 0.2s',
                              background: !selectedCar ? '#f1f5f9' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = !selectedCar ? '#f1f5f9' : 'transparent'}
                          >
                            No specific vehicle
                          </div>
                          {cars.filter(car => 
                            `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
                          ).map(car => (
                            <div 
                              key={car.id}
                              onClick={() => { handleCarChange(car.id); setIsOpen(false); setSearchTerm(''); }}
                              style={{ 
                                padding: '0.75rem', borderRadius: '0.375rem', cursor: 'pointer',
                                fontSize: '0.875rem', color: '#0f172a', transition: 'background 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: selectedCar?.id === car.id ? '#f1f5f9' : 'transparent'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseLeave={(e) => e.currentTarget.style.background = selectedCar?.id === car.id ? '#f1f5f9' : 'transparent'}
                            >
                              <span>{car.year} {car.make} {car.model}</span>
                              {selectedCar?.id === car.id && <Check size={14} className="text-primary" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 1. Personal Information */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '1.25rem' }}>1. Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input required type="text" placeholder="John Doe" style={inputStyle}
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input required type="date" style={inputStyle}
                      value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input required type="tel" placeholder="+1 (555) 000-0000" style={inputStyle}
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input required type="email" placeholder="john@example.com" style={inputStyle}
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Current Address</label>
                  <input required type="text" placeholder="123 Street Name" style={inputStyle}
                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input required type="text" placeholder="City" style={inputStyle}
                      value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <input required type="text" placeholder="State" style={inputStyle}
                      value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Zip Code</label>
                    <input required type="text" placeholder="12345" style={inputStyle}
                      value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Monthly Income (USD)</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input required type="number" placeholder="5,000" style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                        value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>How long at this address?</label>
                    <input required type="text" placeholder="e.g., 3 years" style={inputStyle}
                      value={formData.duration_at_address} onChange={e => setFormData({ ...formData, duration_at_address: e.target.value })} />
                  </div>
                </div>

                <div style={formData.duration_at_address.toLowerCase().includes('year') && parseInt(formData.duration_at_address) < 2 ? { marginBottom: '1rem' } : { marginBottom: '1rem' }}>
                   <label style={labelStyle}>Previous Address (if less than 2 years)</label>
                   <textarea placeholder="Previous street, city, state, zip..."
                    style={{ ...inputStyle, height: '80px', resize: 'none' }}
                    value={formData.prev_address} onChange={e => setFormData({ ...formData, prev_address: e.target.value })} />
                </div>
              </div>

              {/* 2. Identification */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '1.25rem' }}>2. Identification</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>DL/ID Number</label>
                    <input required type="text" placeholder="Number" style={inputStyle}
                      value={formData.dl_number} onChange={e => setFormData({ ...formData, dl_number: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>State of Issue</label>
                    <input required type="text" placeholder="State" style={inputStyle}
                      value={formData.dl_state} onChange={e => setFormData({ ...formData, dl_state: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Expiration Date</label>
                    <input required type="date" style={inputStyle}
                      value={formData.dl_expiry} onChange={e => setFormData({ ...formData, dl_expiry: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* 3. References (Optional) */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '1.25rem' }}>3. References (Optional)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Reference Name</label>
                    <input type="text" placeholder="Name" style={inputStyle}
                      value={formData.ref_name} onChange={e => setFormData({ ...formData, ref_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" placeholder="Phone" style={inputStyle}
                      value={formData.ref_phone} onChange={e => setFormData({ ...formData, ref_phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Relationship</label>
                    <input type="text" placeholder="e.g., Friend" style={inputStyle}
                      value={formData.ref_relationship} onChange={e => setFormData({ ...formData, ref_relationship: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Financing Details */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '1.25rem' }}>Financing Details</h3>

                <div>
                  <label style={labelStyle}>Additional Information (Optional)</label>
                  <textarea placeholder="Tell us about your trade-in or any other details..."
                    style={{ ...inputStyle, height: '110px', resize: 'none' }}
                    value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                </div>
              </div>

              {/* 4. Authorization */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '1.25rem' }}>4. Authorization</h3>
                <label style={{ display: 'flex', gap: '1rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input required type="checkbox" checked={formData.authorized} onChange={e => setFormData({ ...formData, authorized: e.target.checked })}
                    style={{ marginTop: '0.25rem' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
                    I hereby authorize <strong>Attkisson Autos</strong> or its financing partners to verify my employment, income and residence information for the purpose of processing this vehicle financing application.
                  </span>
                </label>
              </div>

              <button disabled={status === 'loading'} style={{
                width: '100%', padding: '1rem',
                background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '0.625rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
                marginTop: '1.5rem',
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
