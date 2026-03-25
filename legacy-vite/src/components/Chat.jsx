import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { notifyNewChat } from '../lib/emailService'

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatId, setChatId] = useState(localStorage.getItem('attkisson_chat_id'))
  const [userId, setUserId] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null)
    })
  }, [])

  useEffect(() => {
    if (chatId) {
      fetchMessages()
      console.log('Subscribing to chat:', chatId)
      const subscription = supabase
        .channel(`user_chat_${chatId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `chat_id=eq.${chatId}` 
        }, (payload) => {
          console.log('User-side new message:', payload)
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            
            // Play sound if message is from admin and chat is closed OR not scrolled to bottom
            if (payload.new.sender === 'admin') {
              const audio = new Audio('/notification.mp3')
              audio.play().catch(e => console.warn('Audio playback failed:', e))
            }
            
            return [...prev, payload.new]
          })
        })
        .subscribe()
      
      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [chatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    let currentChatId = chatId
    if (!currentChatId) {
      const { data, error } = await supabase
        .from('chats')
        .insert([{ 
          subject: 'Customer Support',
          user_id: userId 
        }])
        .select()
      
      if (data?.[0]) {
        currentChatId = data[0].id
        setChatId(currentChatId)
        localStorage.setItem('attkisson_chat_id', currentChatId)
        
        // Notify admin of new chat
        notifyNewChat({
          id: currentChatId,
          name: userId ? 'Authenticated User' : 'Guest Visitor',
          message: message
        }).catch(err => console.error('Email notify failed:', err))
      } else {
        console.error('Failed to start chat:', error)
        return
      }
    }

    const newMessage = {
      chat_id: currentChatId,
      sender: 'user',
      content: message
    }

    const { error } = await supabase.from('messages').insert([newMessage])
    if (!error) setMessage('')
  }

  // Listen for global toggle events
  useEffect(() => {
    const handleToggle = () => setIsOpen(true)
    window.addEventListener('openChat', handleToggle)
    return () => window.removeEventListener('openChat', handleToggle)
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              width: '350px',
              height: '500px',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              color: '#0f172a'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1rem', background: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800 }}>Live Support</p>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%' }} /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: '#fff', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
              {messages.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.4 }}>
                  <MessageCircle size={40} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.875rem' }}>Hello! How can we assist you today?</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '80%', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      background: msg.sender === 'user' ? '#ef4444' : '#fff',
                      color: msg.sender === 'user' ? '#fff' : '#0f172a',
                      border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      borderTopRightRadius: msg.sender === 'user' ? 0 : '1rem',
                      borderTopLeftRadius: msg.sender === 'user' ? '1rem' : 0,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', background: '#fff' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button type="submit" style={{ 
                width: 40, height: 40, background: '#ef4444', borderRadius: '0.75rem', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                cursor: 'pointer', border: 'none'
              }}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 64, height: 64, background: '#ef4444', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 10px 25px rgba(239,68,68,0.3)', cursor: 'pointer',
          transition: 'transform 0.2s', border: 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <ChevronDown size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  )
}

export default Chat
