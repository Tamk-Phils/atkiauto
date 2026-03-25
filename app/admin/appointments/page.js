"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Search, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminSupabase } from '@/lib/adminSupabase'

const AppointmentManagerPage = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newCount, setNewCount] = useState(0)

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
    await adminSupabase.from('appointments').update({ status }).eq('id', id)
  }

  const filtered = appointments.filter(a =>
    `${a.name ?? ''} ${a.email ?? ''} ${a.service_type ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-full overflow-x-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate uppercase italic">
            Service <span className="text-primary">Appointments</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Manage scheduled maintenance — updates are live.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {newCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="bg-primary text-white rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-1.5">
              <Bell size={10} /> +{newCount} new
            </motion.div>
          )}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3.5 py-1.5 leading-none">
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Live</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 w-full mb-8">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, service or email…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-200 transition-all text-left" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                {['Customer', 'Date & Time', 'Service', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Loading appointments…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">No appointments found.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((apt) => (
                    <motion.tr key={apt.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-900 shrink-0 uppercase tracking-tight">
                            {apt.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm mb-0.5 truncate uppercase tracking-tight">{apt.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate italic">{apt.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <p className="font-black text-slate-900 text-sm flex items-center gap-1.5 mb-1 uppercase tracking-tight italic">
                          <CalendarIcon size={12} className="text-primary" />{apt.appointment_date}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase italic tracking-widest">
                          <Clock size={12} className="text-slate-300" />{apt.appointment_time}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 italic">
                          {apt.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          apt.status === 'confirmed' ? 'bg-green-50 border-green-100 text-green-600' : 
                          apt.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-600' : 
                          'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full mr-1.5 ${
                            apt.status === 'confirmed' ? 'bg-green-500' : 
                            apt.status === 'cancelled' ? 'bg-red-500' : 
                            'bg-amber-500'}`} 
                          />
                          {apt.status ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button title="Confirm" onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-green-500 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm">
                            <CheckCircle2 size={16} />
                          </button>
                          <button title="Cancel" onClick={() => updateStatus(apt.id, 'cancelled')}
                             className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                            <XCircle size={16} />
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

export default AppointmentManagerPage
