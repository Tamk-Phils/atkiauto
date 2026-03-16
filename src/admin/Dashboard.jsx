import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Car, Calendar, DollarSign,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Mail, CheckCircle2, Clock, Zap
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'

/* ── Shared admin style tokens ── */
const card = {
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: '1rem', padding: '1.5rem',
}
const badge = (color) => ({
  display: 'inline-block',
  padding: '0.25rem 0.75rem',
  borderRadius: '999px',
  fontSize: '0.6rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  background: color === 'red' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
  color: color === 'red' ? '#ef4444' : '#16a34a',
  border: `1px solid ${color === 'red' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
})

const Dashboard = () => {
  const [counts, setCounts] = useState({ cars: 0, leads: 0, appointments: 0, users: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [liveActivity, setLiveActivity] = useState([])
  const activityRef = useRef([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchCounts = async () => {
    const [carsRes, leadsRes, aptsRes, usersRes] = await Promise.all([
      adminSupabase.from('cars').select('id', { count: 'exact', head: true }),
      adminSupabase.from('leads').select('id', { count: 'exact', head: true }),
      adminSupabase.from('appointments').select('id', { count: 'exact', head: true }),
      adminSupabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])
    const results = { cars: 0, leads: 0, apts: 0, users: 0 }
    
    if (carsRes.error) console.error('Dashboard Error [cars]:', carsRes.error)
    else results.cars = carsRes.count ?? 0

    if (leadsRes.error) console.error('Dashboard Error [leads]:', leadsRes.error)
    else results.leads = leadsRes.count ?? 0

    if (aptsRes.error) console.error('Dashboard Error [apts]:', aptsRes.error)
    else results.apts = aptsRes.count ?? 0

    if (usersRes.error) console.error('Dashboard Error [users]:', usersRes.error)
    else results.users = usersRes.count ?? 0

    setCounts({
      cars: results.cars,
      leads: results.leads,
      appointments: results.apts,
      users: results.users,
    })
  }

  const fetchRecentLeads = async () => {
    const { data } = await adminSupabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5)
    if (data) setRecentLeads(data)
  }

  const pushActivity = (msg) => {
    const entry = { id: Date.now(), msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    activityRef.current = [entry, ...activityRef.current].slice(0, 8)
    setLiveActivity([...activityRef.current])
  }

  useEffect(() => {
    fetchCounts()
    fetchRecentLeads()

    /* ── Real-time subscriptions as Admin ── */
    const leadsChannel = adminSupabase.channel('rt-leads-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (p) => {
        fetchCounts()
        fetchRecentLeads()
        pushActivity(`🔔 New lead from ${p.new.name ?? 'visitor'}`)
      })
      .subscribe()

    const aptsChannel = adminSupabase.channel('rt-appointments-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (p) => {
        fetchCounts()
        if (p.eventType === 'INSERT') pushActivity(`📅 New appointment by ${p.new.name ?? 'user'}`)
        if (p.eventType === 'UPDATE') pushActivity(`✅ Appointment status → ${p.new.status}`)
      })
      .subscribe()

    const carsChannel = adminSupabase.channel('rt-cars-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, (p) => {
        fetchCounts()
        if (p.eventType === 'INSERT') pushActivity(`🚗 New vehicle added to inventory`)
        if (p.eventType === 'DELETE') pushActivity(`🗑️ Vehicle removed from inventory`)
      })
      .subscribe()

    const chatsChannel = adminSupabase.channel('rt-chats-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => {
        fetchCounts()
        pushActivity(`💬 New live chat started`)
      })
      .subscribe()

    return () => {
      adminSupabase.removeChannel(leadsChannel)
      adminSupabase.removeChannel(aptsChannel)
      adminSupabase.removeChannel(carsChannel)
      adminSupabase.removeChannel(chatsChannel)
    }
  }, [])

  const stats = [
    { label: 'Total Inventory', value: counts.cars, icon: <Car size={20} />, color: '#ef4444' },
    { label: 'Total Users', value: counts.users, icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Active Leads', value: counts.leads, icon: <Mail size={20} />, color: '#8b5cf6' },
    { label: 'Appointments', value: counts.appointments, icon: <Calendar size={20} />, color: '#10b981' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ 
        marginBottom: '2.5rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
            Welcome back, <span style={{ color: '#ef4444' }}>Admin</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Here's what's happening at AttkissonAutos right now.</p>
        </div>
        {/* Sync Button */}
        <button 
          onClick={async () => {
            const { data: { users } } = await adminSupabase.auth.admin.listUsers()
            if (users) {
              for (const u of users) {
                await adminSupabase.from('profiles').upsert({
                  id: u.id,
                  email: u.email,
                  full_name: u.user_metadata?.full_name || 'Legacy User'
                })
              }
              alert('Profiles synchronized successfully!')
              fetchCounts()
            }
          }}
          style={{ ...badge('green'), cursor: 'pointer', marginLeft: 'auto' }}
        >
          Sync Users
        </button>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.4rem 1rem' }}>
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? (window.innerWidth < 640 ? '1fr' : '1fr 1fr') : 'repeat(4, 1fr)', 
        gap: '1.25rem', 
        marginBottom: '2rem' 
      }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <ArrowUpRight size={14} color="#16a34a" />
            </div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>{s.label}</p>
            <p style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', 
        gap: '1.5rem' 
      }}>
        {/* Recent Leads */}
        <div style={{ ...card, padding: isMobile ? '1.25rem' : '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a0a0b' }}>Recent Leads</h2>
            <span style={{ ...badge('red'), cursor: 'pointer' }}>Live</span>
          </div>
          {recentLeads.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No leads yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentLeads.map((lead, i) => (
                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < recentLeads.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', color: '#0a0a0b', flexShrink: 0 }}>
                    {lead.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0a0a0b', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Mail size={10} /> {lead.email}
                    </p>
                  </div>
                  {!isMobile && <span style={badge(lead.status === 'responded' ? 'green' : 'red')}>{lead.status ?? 'new'}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div style={{ ...card, padding: isMobile ? '1.25rem' : '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={16} color="#ef4444" />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a0a0b' }}>Live Activity</h2>
          </div>
          {liveActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Watching for new events…<br />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />)}
              </motion.div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {liveActivity.map((ev, i) => (
                <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#334155', flex: 1 }}>{ev.msg}</p>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={10} />{ev.time}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
