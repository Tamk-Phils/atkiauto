"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, CheckCircle2, Search, Trash2, Clock, Eye, X, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminSupabase } from '@/lib/adminSupabase'

const FinanceManagerPage = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchLeads = async () => {
    const { data } = await adminSupabase
      .from('leads')
      .select('*, cars(make, model, year)')
      .eq('type', 'finance')
      .order('created_at', { ascending: false })
    if (data) setLeads(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()

    const channel = supabase.channel('rt-finance-manager')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads',
        filter: 'type=eq.finance' 
      }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    // Optimistic update
    const previousLeads = [...leads]
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))

    const { error } = await adminSupabase.from('leads').update({ status }).eq('id', id)
    if (error) {
      console.error('Update status failed:', error)
      setLeads(previousLeads) // Rollback
      alert('Failed to update status. Please try again.')
    }
  }

  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    
    // Optimistic delete
    const previousLeads = [...leads]
    setLeads(prev => prev.filter(l => l.id !== id))

    const { error } = await adminSupabase.from('leads').delete().eq('id', id)
    if (error) {
      console.error('Delete failed:', error)
      setLeads(previousLeads) // Rollback
      alert('Failed to delete lead. Please try again.')
    }
  }

  const filtered = leads.filter(l =>
    `${l.name ?? ''} ${l.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-full overflow-x-hidden text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate uppercase italic">
            Financing <span className="text-primary">Applications</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Review and manage vehicle finance requests.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 leading-none">
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Applications Live</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 w-full mb-8">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search applicant name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-200 transition-all text-left"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
            {filtered.length} Application{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-w-full" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          <table className="border-collapse table-fixed" style={{ width: '1200px', minWidth: '1200px' }}>
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-[200px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Applicant</th>
                <th className="w-[250px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Vehicle Details</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Income Info</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Status</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Date</th>
                <th className="w-[150px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Loading applications…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">No financing applications found.</td></tr>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {filtered.map((lead) => (
                    <motion.tr key={lead.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{lead.name}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-300" />{lead.email}</span>
                          {lead.phone && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate"><Phone size={12} className="text-slate-300" />{lead.phone}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        {lead.cars ? (
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-[10px] uppercase truncate">{lead.cars.year} {lead.cars.make}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{lead.cars.model}</p>
                          </div>
                        ) : <span className="text-[10px] font-bold text-slate-300 uppercase italic">General Inquiry</span>}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                             <DollarSign size={14} />
                           </div>
                           <p className="font-black text-slate-900 text-sm tracking-tight">${parseFloat(lead.income || 0).toLocaleString()}<span className="text-[10px] text-slate-400 font-bold ml-1">/mo</span></p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          lead.status === 'responded' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full mr-1.5 ${lead.status === 'responded' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {lead.status ?? 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" />{new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedLead(lead)}
                            title="View Full Application"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => updateStatus(lead.id, lead.status === 'responded' ? 'new' : 'responded')}
                            title="Toggle status"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-green-500 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} title="Delete Application"
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

      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-left">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Finance Application</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedLead.name} • Internal ID: {selectedLead.id.split('-')[0]}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {(() => {
                  let displayData = selectedLead.data;
                  let displayMessage = selectedLead.message;
                  
                  const isDataEmpty = !displayData || (typeof displayData === 'object' && Object.keys(displayData).length === 0);
                  
                  if (isDataEmpty && displayMessage?.startsWith('[JSON]')) {
                    try {
                      const jsonPart = displayMessage.substring(6);
                      displayData = JSON.parse(jsonPart);
                      displayMessage = displayData.originalMessage || '';
                    } catch (e) {
                      console.error('Failed to parse JSON message:', e);
                    }
                  }

                  return (
                    <>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Stated Income</p>
                          <p className="text-2xl font-black text-slate-900">${parseFloat(selectedLead.income || displayData?.income || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right text-primary bg-white px-4 py-2 rounded-xl border border-primary/10 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-slate-400">Status</p>
                          <p className="text-xs font-black uppercase italic">{selectedLead.status ?? 'New'}</p>
                        </div>
                      </div>

                      {displayData ? (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-primary pl-3 italic">Personal & Residence</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase">DOB</p><p className="font-bold">{displayData.dob || 'N/A'}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p><p className="font-bold">{displayData.phone || selectedLead.phone || 'N/A'}</p></div>
                              <div className="sm:col-span-2 text-primary bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <p className="text-[10px] font-bold uppercase mb-1">Active Address</p>
                                <p className="font-black leading-tight text-base italic">
                                  {displayData.address}<br />
                                  {displayData.city}, {displayData.state} {displayData.zip}
                                </p>
                                <p className="mt-3 text-[10px] font-black opacity-60 uppercase tracking-widest">Residency Duration: {displayData.duration_at_address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-primary pl-3 italic">Driver Identification</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">DL/ID Number</p><p className="font-black text-slate-900">{displayData.dl_number}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">State</p><p className="font-black text-slate-900">{displayData.dl_state}</p></div>
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expiry</p><p className="font-black text-slate-900">{displayData.dl_expiry}</p></div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-primary pl-3 italic">Personal References</h3>
                            <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                              <div className="text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reference Contact</p>
                                <p className="font-black text-base italic">{displayData.ref_name || 'No reference'}</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{displayData.ref_relationship}</p>
                              </div>
                              {(displayData.ref_phone || selectedLead.data?.ref_phone) && (
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary border border-white/10">
                                  <Phone size={20} />
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-20 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                             <DollarSign size={32} />
                          </div>
                          <p className="text-slate-400 font-bold italic text-sm">Extended details not available for this record type.</p>
                        </div>
                      )}

                      {displayMessage && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Additional Statement</p>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium italic">
                            "{displayMessage}"
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button onClick={() => updateStatus(selectedLead.id, 'responded')} 
                  className="flex-1 bg-green-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl text-[10px] hover:bg-green-600 transition-colors shadow-lg shadow-green-200">
                  Approve / Mark Responded
                </button>
                <button onClick={() => setSelectedLead(null)} className="flex-1 bg-white border border-slate-200 text-slate-400 font-black uppercase tracking-widest py-4 rounded-2xl text-[10px] hover:bg-slate-100 transition-colors">
                  Keep for Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FinanceManagerPage
