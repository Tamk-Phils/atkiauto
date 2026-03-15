import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, CheckCircle2, Search, Trash2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (data) setLeads(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()

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
    await supabase.from('leads').update({ status }).eq('id', id)
  }

  const deleteLead = async (id) => {
    await supabase.from('leads').delete().eq('id', id)
  }

  const filtered = leads.filter(l =>
    `${l.name ?? ''} ${l.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Lead <span style={{ color: '#ef4444' }}>Inquiries</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Real-time customer interest from Contact forms.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {newCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
              background: '#ef4444', color: '#fff', borderRadius: '999px',
              padding: '0.3rem 0.75rem', fontSize: '0.65rem', fontWeight: 800,
            }}>
              +{newCount} new
            </motion.div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.35rem 0.875rem' }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
        {/* Search Bar */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0a0a0b', flex: 1, fontFamily: 'inherit', background: 'transparent' }}
          />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Customer', 'Type', 'Status', 'Message', 'Date', 'Actions'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading leads…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No inquiries yet.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((lead) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={td}>
                        <p style={{ fontWeight: 700, color: '#0a0a0b', marginBottom: '0.25rem' }}>{lead.name}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={10} />{lead.email}</span>
                          {lead.phone && <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={10} />{lead.phone}</span>}
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
                          {lead.type}
                        </span>
                      </td>
                      <td style={td}><span style={statusStyle(lead.status)}>{lead.status ?? 'new'}</span></td>
                      <td style={{ ...td, maxWidth: 240 }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.message || '—'}
                        </p>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                          <Clock size={10} />{new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={() => updateStatus(lead.id, lead.status === 'responded' ? 'new' : 'responded')}
                            title="Toggle status"
                            style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <CheckCircle2 size={15} />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} title="Delete"
                            style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <Trash2 size={15} />
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
