"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, CheckCircle2, Search, Trash2, Clock, Car } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminSupabase } from '@/lib/adminSupabase'

const ReservationManagerPage = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newCount, setNewCount] = useState(0)

  const fetchReservations = async () => {
    const { data } = await adminSupabase
      .from('reservations')
      .select(`
        *,
        cars (make, model, year, price),
        profiles!user_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setReservations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReservations()

    const channel = supabase.channel('rt-reservations-manager')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, (payload) => {
        fetchReservations() // Refetch to get joined data
        setNewCount(c => c + 1)
        setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 5000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservations' }, (payload) => {
        fetchReservations()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reservations' }, (payload) => {
        setReservations(prev => prev.filter(r => r.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    // Optimistic update
    const previousReservations = [...reservations]
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))

    const { error } = await adminSupabase.from('reservations').update({ status }).eq('id', id)
    if (error) {
      console.error('Update status failed:', error)
      setReservations(previousReservations) // Rollback
      alert('Failed to update status. Please try again.')
    }
  }

  const deleteReservation = async (id) => {
    if (!confirm('Permanently delete this reservation?')) return
    
    // Optimistic delete
    const previousReservations = [...reservations]
    setReservations(prev => prev.filter(r => r.id !== id))

    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'reservations', id })
      })
      if (!response.ok) throw new Error('Delete failed')
    } catch (error) {
      console.error('Delete error:', error)
      setReservations(previousReservations) // Rollback
      alert(`Delete failed: ${error.message}`)
    }
  }

  const filtered = reservations.filter(r =>
    `${r.profiles?.full_name ?? ''} ${r.profiles?.email ?? ''} ${r.cars?.make ?? ''} ${r.cars?.model ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-full overflow-x-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate uppercase italic">
            Vehicle <span className="text-primary">Reservations</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Manage customer bookings and pending deposits.</p>
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
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Live Monitoring</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 w-full mb-8">
        {/* Search Bar */}
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search by customer or car…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-200 transition-all text-left"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-w-full" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          <table className="border-collapse table-fixed" style={{ width: '1200px', minWidth: '1200px' }}>
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-[250px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Customer</th>
                <th className="w-[250px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Vehicle</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Fee</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Status</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Date</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Loading reservations…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">No reservations found.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((res) => (
                    <motion.tr key={res.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{res.profiles?.full_name || 'Guest User'}</p>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate">
                          <Mail size={12} className="text-slate-300" />{res.profiles?.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Car size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-xs mb-0.5 truncate uppercase tracking-tight">{res.cars?.year} {res.cars?.make}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{res.cars?.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <p className="font-black text-primary text-sm tracking-tight">${parseFloat(res.fee).toLocaleString()}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${res.payment_status === 'paid' ? 'text-green-500' : 'text-slate-400'}`}>
                          {res.payment_status}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          res.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 
                          res.status === 'paid' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                          'bg-red-50 border-red-100 text-red-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full mr-1.5 ${
                            res.status === 'completed' ? 'bg-green-500' : 
                            res.status === 'paid' ? 'bg-blue-500' : 
                            'bg-red-500'}`} 
                          />
                          {res.status ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" />{new Date(res.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(res.id, res.status === 'completed' ? 'pending' : 'completed')}
                            title="Toggle status"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-green-500 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => deleteReservation(res.id)} title="Delete"
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

export default ReservationManagerPage
