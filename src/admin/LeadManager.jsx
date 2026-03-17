import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, CheckCircle2, Search, Trash2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'

const statusStyle = (status) => ({
  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px',
  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
  background: status === 'responded' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
  color: status === 'responded' ? '#16a34a' : '#ef4444',
  border: `1px solid ${status === 'responded' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
})

const th = { padding: '0.875rem 1.25rem', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8', textAlign: 'left' }
const td = { padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' }

const LeadManager = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newCount, setNewCount] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*, cars(make, model, year)')
      .order('created_at', { ascending: false })
    if (data) setLeads(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
    // ... rest same

    const channel = supabase.channel('rt-leads-manager')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new, ...prev])
        setNewCount(c => c + 1)
        setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 5000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new : l))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => prev.filter(l => l.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    await adminSupabase.from('leads').update({ status }).eq('id', id)
  }

  const deleteLead = async (id) => {
    await adminSupabase.from('leads').delete().eq('id', id)
  }

  const filtered = leads.filter(l =>
    `${l.name ?? ''} ${l.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">
            Customer <span className="text-primary">Leads</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Track inquiries and new contacts.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {newCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="bg-primary text-white rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              +{newCount} new
            </motion.div>
          )}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3.5 py-1.5 leading-none">
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Live Monitor</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 w-full">
        {/* Search Bar */}
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-200 transition-all"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                {['Customer', 'Type', 'Vehicle', 'Down Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Loading leads…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">No inquiries found.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((lead) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{lead.name}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-300" />{lead.email}</span>
                          {lead.phone && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate"><Phone size={12} className="text-slate-300" />{lead.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                          {lead.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.cars ? (
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-[10px] uppercase truncate">{lead.cars.year} {lead.cars.make}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{lead.cars.model}</p>
                          </div>
                        ) : <span className="text-[10px] font-bold text-slate-300 uppercase italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-primary text-sm tracking-tight">
                          ${parseFloat(lead.down_payment || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          lead.status === 'responded' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full mr-1.5 ${lead.status === 'responded' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {lead.status ?? 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" />{new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(lead.id, lead.status === 'responded' ? 'new' : 'responded')}
                            title="Toggle status"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-green-500 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} title="Delete"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                            <Trash2 size={16} />
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

export default LeadManager
