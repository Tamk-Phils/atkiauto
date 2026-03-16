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
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <button 
        onClick={() => setMuted(!muted)}
        style={{ 
          padding: '0.5rem', 
          background: muted ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
          border: `1px solid ${muted ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          borderRadius: '0.75rem',
          color: muted ? '#ef4444' : '#16a34a',
          fontSize: '0.6rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          backdropFilter: 'blur(8px)'
        }}
      >
        {muted ? '🔇 Sound Off' : '🔊 Sound On'}
      </button>
    </div>
  )
}

export default AdminNotifier
