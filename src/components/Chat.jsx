import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatId, setChatId] = useState(localStorage.getItem('attkisson_chat_id'))
  const scrollRef = useRef()

  useEffect(() => {
    if (chatId) {
      fetchMessages()
      const subscription = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
          (payload) => {
            setMessages(prev => [...prev, payload.new])
          }
        )
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
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const startChat = async () => {
    const { data, error } = await supabase.from('chats').insert([{ subject: 'General Support' }]).select()
    if (data) {
      const newId = data[0].id
      setChatId(newId)
      localStorage.setItem('attkisson_chat_id', newId)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    let currentChatId = chatId
    if (!currentChatId) {
      const { data } = await supabase.from('chats').insert([{ subject: 'Guest Support' }]).select()
      if (data) {
        currentChatId = data[0].id
        setChatId(currentChatId)
        localStorage.setItem('attkisson_chat_id', currentChatId)
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

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-[350px] h-[500px] mb-4 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">Concierge Support</p>
                  <p className="text-[10px] uppercase opacity-80 tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <MessageCircle size={40} className="text-primary/20" />
                  <p className="text-sm text-text-muted">Hello! How can we assist you with your dream car today?</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'glass text-white rounded-tl-none border-glass-border'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-glass-border flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button type="submit" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group"
      >
        {isOpen ? <ChevronDown size={28} /> : <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  )
}

export default Chat
