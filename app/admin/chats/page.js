"use client"
import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Search, MessageSquare, User, Send, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminSupabase } from '@/lib/adminSupabase'
import { useSearchParams } from 'next/navigation'

const ChatManagerContent = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [profiles, setProfiles] = useState({})
  const processedRedirection = useRef(false)
  const searchParams = useSearchParams()
  const scrollRef = useRef()

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchChats = async () => {
    setLoading(true)
    const { data, error } = await adminSupabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching chats:', error)
    } else if (data) {
      setChats(data)
      const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        fetchProfiles(userIds)
      }
    }
    setLoading(false)
  }

  const fetchProfiles = async (userIds) => {
    const { data } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)
    
    if (data) {
      const newProfiles = { ...profiles }
      data.forEach(p => {
        newProfiles[p.id] = p
      })
      setProfiles(newProfiles)
    }
  }

  useEffect(() => {
    fetchChats()

    const chatSub = adminSupabase
      .channel('admin_global_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats()
      })
      .subscribe()

    const msgSub = adminSupabase
      .channel('admin_global_messages_listener')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchChats()
      })
      .subscribe()

    return () => {
      adminSupabase.removeChannel(chatSub)
      adminSupabase.removeChannel(msgSub)
    }
  }, [])

  useEffect(() => {
    const targetChatId = searchParams.get('id')
    if (!targetChatId || processedRedirection.current || loading) return

    const found = chats.find(c => c.id === targetChatId)
    if (found) {
      setSelectedChat(found)
      processedRedirection.current = true
    } else {
      // Fetch specific if not in list
      const fetchSpecific = async () => {
        const { data } = await adminSupabase.from('chats').select('*').eq('id', targetChatId).maybeSingle()
        if (data) {
          setSelectedChat(data)
          processedRedirection.current = true
        }
      }
      fetchSpecific()
    }
  }, [loading, chats, searchParams])

  useEffect(() => {
    if (selectedChat) {
      setMessages([])
      const fetchMessages = async () => {
        const { data } = await adminSupabase
          .from('messages')
          .select('*')
          .eq('chat_id', selectedChat.id)
          .order('created_at', { ascending: true })
        if (data) setMessages(data)
      }
      fetchMessages()
      
      const sub = adminSupabase
        .channel(`admin_messages_for_${selectedChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        }, (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        })
        .subscribe()

      return () => {
        adminSupabase.removeChannel(sub)
      }
    }
  }, [selectedChat?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const content = newMessage.trim()
    setNewMessage('')

    const { data: inserted, error } = await adminSupabase
      .from('messages')
      .insert([{ chat_id: selectedChat.id, sender: 'admin', content }])
      .select()
      .single()

    if (error) {
      setNewMessage(content)
      alert(`Failed to send message: ${error.message}`)
    } else if (inserted) {
      setMessages(prev => [...prev.filter(m => m.id !== inserted.id), inserted])
      fetchChats()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] text-left">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase italic">Support <span className="text-primary">Center</span></h1>
        {!isMobile && <p className="text-slate-500 font-medium">Direct real-time communication with your visitors.</p>}
      </header>

      <div className={`flex-1 flex gap-4 lg:gap-8 min-h-0 ${isMobile ? 'flex-col' : ''}`}>
        <div className={`
          bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm
          ${isMobile && selectedChat ? 'hidden' : 'w-full lg:w-80 h-full'}
        `}>
          <div className="p-4 border-b border-slate-100 italic">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-slate-300 transition-colors text-left"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">No active chats</div>
            ) : chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                  selectedChat?.id === chat.id ? 'bg-primary/5 border-r-4 border-r-primary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary shrink-0 border border-slate-200">
                  <User size={20} />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">
                    {profiles[chat.user_id]?.full_name || `Guest_${chat.id.slice(0, 5)}`}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                    {profiles[chat.user_id]?.email || 'Active Session'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`
          flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm
          ${isMobile && !selectedChat ? 'hidden' : 'h-full'}
        `}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3 text-left">
                  {isMobile && (
                    <button onClick={() => setSelectedChat(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                      {profiles[selectedChat.user_id]?.full_name || `Guest_${selectedChat.id.slice(0, 5)}`}
                    </h3>
                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest italic">Live Connection</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-slate-50/30 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] lg:max-w-[70%] space-y-1">
                      <div 
                        className={`p-3 lg:p-4 rounded-2xl text-sm font-medium ${
                          msg.sender === 'admin' 
                            ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' 
                            : 'bg-white text-slate-900 shadow-sm border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2 lg:gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-300 transition-colors text-left"
                />
                <button type="submit" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 lg:p-12 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 border border-slate-100 mb-2">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Support Inbox</h2>
              <p className="text-slate-400 font-medium max-w-xs text-xs">Select a conversation to start assisting visitors in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ChatManagerPage = () => {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-slate-400 italic">Initializing Support Hub...</div>}>
      <ChatManagerContent />
    </Suspense>
  )
}

export default ChatManagerPage
