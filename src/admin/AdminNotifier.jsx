import React, { useEffect, useRef } from 'react'
import { adminSupabase } from '../lib/adminSupabase'

const AdminNotifier = () => {
  const audioRef = useRef(null)
  const [muted, setMuted] = React.useState(true) // Start muted to avoid browser blocks

  useEffect(() => {
    // Try to auto-unmute if user interacts
    const unlock = () => {
      setMuted(false)
      window.removeEventListener('click', unlock)
    }
    window.addEventListener('click', unlock)
    return () => window.removeEventListener('click', unlock)
  }, [])
  useEffect(() => {
    console.log('AdminNotifier: Starting global listeners')

    // 1. Listen for new messages
    const msgSub = adminSupabase
      .channel('admin-global-notifier-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: 'sender=eq.user' // Only notify for user messages
      }, (payload) => {
        console.log('AdminNotifier: New message received', payload)
        playNotification()
      })
      .subscribe()

    // 2. Listen for new leads
    const leadsSub = adminSupabase
      .channel('admin-global-notifier-leads')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'leads' 
      }, (payload) => {
        console.log('AdminNotifier: New lead received', payload)
        playNotification()
      })
      .subscribe()

    // 3. Listen for new appointments
    const aptsSub = adminSupabase
      .channel('admin-global-notifier-appointments')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'appointments' 
      }, (payload) => {
        console.log('AdminNotifier: New appointment received', payload)
        playNotification()
      })
      .subscribe()

    // 4. Listen for new chats
    const chatsSub = adminSupabase
      .channel('admin-global-notifier-chats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chats' 
      }, (payload) => {
        console.log('AdminNotifier: New chat started', payload)
        playNotification()
      })
      .subscribe()

    // 5. Listen for new reservations
    const reservationsSub = adminSupabase
      .channel('admin-global-notifier-reservations')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'reservations' 
      }, (payload) => {
        console.log('AdminNotifier: New reservation received', payload)
        playNotification()
      })
      .subscribe()

    return () => {
      adminSupabase.removeChannel(msgSub)
      adminSupabase.removeChannel(leadsSub)
      adminSupabase.removeChannel(aptsSub)
      adminSupabase.removeChannel(chatsSub)
      adminSupabase.removeChannel(reservationsSub)
    }
  }, [])

  const playNotification = () => {
    // Attempting to play sound - requires previous user interaction with page
    if (audioRef.current && !muted) {
      audioRef.current.currentTime = 0
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Auto-play was prevented. Interaction required.', error)
        })
      }
    }
    
    // Also update document title to catch attention
    const oldTitle = document.title
    document.title = '🔔 NEW NOTIFICATION!'
    setTimeout(() => { document.title = oldTitle }, 3000)
  }

  return (
    <div className="group">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <button 
        onClick={() => setMuted(!muted)}
        className={`px-3 py-2 rounded-xl border backdrop-blur-md text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
          muted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
        }`}
      >
        {muted ? '🔇 Muted' : '🔊 Live'}
      </button>
    </div>
  )
}

export default AdminNotifier
