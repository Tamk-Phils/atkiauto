"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle2, MessageSquare, Ticket, Calendar, UserPlus } from 'lucide-react'
import { adminSupabase } from '@/lib/adminSupabase'

const AdminNotifier = () => {
  const [toasts, setToasts] = useState([])
  const [muted, setMuted] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const unlock = () => {
      setMuted(false)
      window.removeEventListener('click', unlock)
    }
    window.addEventListener('click', unlock)
    return () => window.removeEventListener('click', unlock)
  }, [])

  const addToast = (type, title, message) => {
    const id = Date.now()
    const icons = {
      message: <MessageSquare size={18} className="text-blue-500" />,
      lead: <UserPlus size={18} className="text-purple-500" />,
      finance: <CheckCircle2 size={18} className="text-primary" />,
      reservation: <Ticket size={18} className="text-amber-500" />,
      appointment: <Calendar size={18} className="text-green-500" />
    }

    const newToast = { id, type, title, message, icon: icons[type] || <Bell size={18} /> }
    setToasts(prev => [newToast, ...prev].slice(0, 5))
    
    // Play sound and flash title
    playNotification()

    // Auto-remove after 8 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 8000)
  }

  const playNotification = () => {
    if (audioRef.current && !muted) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    const oldTitle = document.title
    document.title = '🔔 NEW ADMIN ALERT!'
    setTimeout(() => { document.title = oldTitle }, 3000)
  }

  useEffect(() => {
    // 1. Leads Listener (Including Finance)
    const leadsSub = adminSupabase.channel('admin-realtime-leads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const isFinance = payload.new.type === 'finance'
        addToast(
          isFinance ? 'finance' : 'lead',
          isFinance ? 'New Financing Request' : 'New Contact Inquiry',
          `From ${payload.new.name || 'Visitor'}`
        )
      })
      .subscribe()

    // 2. Reservations Listener
    const resSub = adminSupabase.channel('admin-realtime-reservations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, (payload) => {
        addToast('reservation', 'New Vehicle Reservation', 'A new reservation has been placed.')
      })
      .subscribe()

    // 3. Messages Listener
    const msgSub = adminSupabase.channel('admin-realtime-messages')
      .on('postgres_changes', { 
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: 'sender=eq.user'
      }, (payload) => {
        addToast('message', 'New Message Received', payload.new.content.substring(0, 40) + '...')
      })
      .subscribe()

    // 4. Appointments Listener
    const aptsSub = adminSupabase.channel('admin-realtime-apts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        addToast('appointment', 'New Appointment', `${payload.new.name} scheduled for ${payload.new.appointment_date}`)
      })
      .subscribe()

    return () => {
      adminSupabase.removeChannel(leadsSub)
      adminSupabase.removeChannel(resSub)
      adminSupabase.removeChannel(msgSub)
      adminSupabase.removeChannel(aptsSub)
    }
  }, [muted])

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Control Button */}
      <button 
        onClick={() => setMuted(!muted)}
        className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
          muted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {!muted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${muted ? 'bg-red-500' : 'bg-green-500'}`}></span>
        </span>
        {muted ? 'Alerts Paused' : 'Listening Live'}
      </button>

      {/* Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white/90 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-2xl pointer-events-auto flex items-start gap-3 group relative overflow-hidden"
            >
              <div className="w-1.5 h-full absolute left-0 top-0 bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="p-2.5 bg-slate-50 rounded-xl flex-shrink-0">
                {toast.icon}
              </div>
              <div className="flex-1 min-w-0 pr-6 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{toast.title}</p>
                <p className="text-xs font-bold text-slate-900 leading-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="absolute top-2 right-2 text-slate-300 hover:text-slate-600 transition-colors pointer-events-auto"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AdminNotifier
