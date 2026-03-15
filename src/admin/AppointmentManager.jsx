import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Search, Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'

const th = { padding: '0.875rem 1.25rem', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8', textAlign: 'left' }
const td = { padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' }

const statusStyle = (s) => ({
  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px',
  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
  ...(s === 'confirmed'
    ? { background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
    : s === 'cancelled'
    ? { background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
    : { background: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }),
})

const AppointmentManager = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newCount, setNewCount] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true })
    if (data) setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()

    const channel = supabase.channel('rt-appointments-mgr')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        setAppointments(prev => [...prev, payload.new].sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)))
        setNewCount(c => c + 1)
        setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 5000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, (payload) => {
        setAppointments(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'appointments' }, (payload) => {
        setAppointments(prev => prev.filter(a => a.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
  }

  const filtered = appointments.filter(a =>
    `${a.name ?? ''} ${a.email ?? ''} ${a.service_type ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Service <span style={{ color: '#ef4444' }}>Appointments</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage scheduled maintenance — updates are live.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          {newCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Bell size={10} /> +{newCount} new
            </motion.div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.35rem 0.875rem' }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Live</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search by name, service or email…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0a0a0b', flex: 1, fontFamily: 'inherit', background: 'transparent' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Customer', 'Date & Time', 'Service', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading appointments…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No appointments found.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((apt) => (
                    <motion.tr key={apt.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#0a0a0b', flexShrink: 0 }}>
                            {apt.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#0a0a0b', fontSize: '0.875rem' }}>{apt.name}</p>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{apt.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={td}>
                        <p style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <CalendarIcon size={12} color="#ef4444" />{apt.appointment_date}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Clock size={11} />{apt.appointment_time}
                        </p>
                      </td>
                      <td style={td}>
                        <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>
                          {apt.service_type}
                        </span>
                      </td>
                      <td style={td}><span style={statusStyle(apt.status)}>{apt.status ?? 'pending'}</span></td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button title="Confirm" onClick={() => updateStatus(apt.id, 'confirmed')}
                            style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <CheckCircle2 size={15} />
                          </button>
                          <button title="Cancel" onClick={() => updateStatus(apt.id, 'cancelled')}
                            style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <XCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AppointmentManager
