"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Car, Calendar,
  ArrowUpRight,
  Mail, Clock, Zap
} from 'lucide-react'
import { adminSupabase } from '@/lib/adminSupabase'

const DashboardPage = () => {
  const [counts, setCounts] = useState({ cars: 0, leads: 0, appointments: 0, users: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [liveActivity, setLiveActivity] = useState([])
  const activityRef = useRef([])

  useEffect(() => {
    fetchCounts()
    fetchRecentLeads()

    const leadsChannel = adminSupabase.channel('rt-leads-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (p) => {
        fetchCounts()
        fetchRecentLeads()
        pushActivity(`🔔 New lead: ${p.new.name ?? 'visitor'}`)
      })
      .subscribe()

    const aptsChannel = adminSupabase.channel('rt-appointments-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (p) => {
        fetchCounts()
        if (p.eventType === 'INSERT') pushActivity(`📅 New appointment: ${p.new.name ?? 'user'}`)
        if (p.eventType === 'UPDATE') pushActivity(`✅ Appointment updated → ${p.new.status}`)
      })
      .subscribe()

    const carsChannel = adminSupabase.channel('rt-cars-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, (p) => {
        fetchCounts()
        if (p.eventType === 'INSERT') pushActivity(`🚗 New vehicle in inventory`)
        if (p.eventType === 'DELETE') pushActivity(`🗑️ Vehicle removed`)
      })
      .subscribe()

    return () => {
      adminSupabase.removeChannel(leadsChannel)
      adminSupabase.removeChannel(aptsChannel)
      adminSupabase.removeChannel(carsChannel)
    }
  }, [])

  const fetchCounts = async () => {
    const [carsRes, leadsRes, aptsRes, usersRes] = await Promise.all([
      adminSupabase.from('cars').select('id', { count: 'exact', head: true }),
      adminSupabase.from('leads').select('id', { count: 'exact', head: true }),
      adminSupabase.from('appointments').select('id', { count: 'exact', head: true }),
      adminSupabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])
    setCounts({
      cars: carsRes.count ?? 0,
      leads: leadsRes.count ?? 0,
      appointments: aptsRes.count ?? 0,
      users: usersRes.count ?? 0,
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

  const stats = [
    { label: 'Total Inventory', value: counts.cars, icon: <Car size={20} />, color: 'primary' },
    { label: 'Total Users', value: counts.users, icon: <Users size={20} />, color: 'blue' },
    { label: 'Active Leads', value: counts.leads, icon: <Mail size={20} />, color: 'purple' },
    { label: 'Appointments', value: counts.appointments, icon: <Calendar size={20} />, color: 'green' },
  ]

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-1 truncate">
            Welcome back, <span className="text-primary">Admin</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Here's what's happening at AttkissonAutos right now.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={async () => {
              const { data: { users } } = await adminSupabase.auth.admin.listUsers()
              if (users) {
                for (const u of users) {
                  await adminSupabase.from('profiles').upsert({
                    id: u.id,
                    email: u.email,
                    full_name: u.user_metadata?.full_name || 'User'
                  })
                }
                alert('Success')
                fetchCounts()
              }
            }}
            className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-colors"
          >
            Sync Users
          </button>
          
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s, i) => (
          <motion.div 
            key={s.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                s.color === 'primary' ? 'bg-primary/10 text-primary' : 
                s.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                s.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {s.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-green-500 transition-colors" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8">
        {/* Recent Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Leads</h2>
            <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-md">NEW</div>
          </div>
          
          <div className="space-y-1">
            {recentLeads.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm italic">No leads found.</div>
            ) : (
              recentLeads.map((lead, i) => (
                <div key={lead.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm flex-shrink-0">
                    {lead.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                      <Mail size={12} /> {lead.email}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      lead.status === 'responded' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {lead.status ?? 'New'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-0">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-primary" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Activity</h2>
          </div>
          
          <div className="space-y-4">
            {liveActivity.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="text-slate-400 text-sm italic">Watching events...</div>
                <div className="flex justify-center gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ opacity: [0.3, 1, 0.3] }} 
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-slate-200"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {liveActivity.map((ev) => (
                  <motion.div 
                    key={ev.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 text-left">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 group-hover:bg-primary transition-colors flex-shrink-0" />
                      <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{ev.msg}</p>
                    </div>
                    <span className="text-[10px] text-slate-300 font-bold whitespace-nowrap pt-1 uppercase italic tracking-wider flex items-center gap-1">
                      <Clock size={10} /> {ev.time}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
