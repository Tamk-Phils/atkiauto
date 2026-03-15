import React, { useState, useEffect, useRef } from 'react'
import { Search, MessageSquare, User, Send, CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ChatManager = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const scrollRef = useRef()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchChats()

    const subscription = supabase
      .channel('chat_list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => fetchChats())
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
      
      const sub = supabase
        .channel(`chat:${selectedChat.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, 
        (payload) => setMessages(prev => [...prev, payload.new])
      )
      .subscribe()

      return () => supabase.removeChannel(sub)
    }
  }, [selectedChat])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchChats = async () => {
    const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: false })
    if (data) setChats(data)
    setLoading(false)
  }

  const fetchMessages = async (chatId) => {
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const message = {
      chat_id: selectedChat.id,
      sender: 'admin',
      content: newMessage
    }

    const { error } = await supabase.from('messages').insert([message])
    if (!error) setNewMessage('')
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-160px)]">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-4xl font-black mb-2">Support <span className="text-primary">Center</span></h1>
        {!isMobile && <p className="text-text-muted">Direct real-time communication with your visitors.</p>}
      </header>

      <div className={`flex-1 flex gap-4 lg:gap-8 min-h-0 ${isMobile ? 'flex-col' : ''}`}>
        {/* Chat List */}
        <div className={`
          glass-card flex flex-col overflow-hidden
          ${isMobile && selectedChat ? 'hidden' : 'w-full lg:w-80 h-full'}
        `}>
          <div className="p-4 border-b border-glass-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-white/5 border border-glass-border rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">No active chats</div>
            ) : chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-glass-border last:border-0 ${
                  selectedChat?.id === chat.id ? 'bg-primary/10 border-r-2 border-r-primary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-bold text-sm truncate">Visitor_{chat.id.slice(0, 5)}</h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-tighter">{chat.status}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className={`
          flex-1 glass-card flex flex-col overflow-hidden
          ${isMobile && !selectedChat ? 'hidden' : 'w-full h-full'}
        `}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="p-2 -ml-2 text-text-muted hover:text-white"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Visitor_{selectedChat.id.slice(0, 5)}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-black/10">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] lg:max-w-[70%] space-y-1">
                      <div className={`p-3 lg:p-4 rounded-2xl text-sm ${
                        msg.sender === 'admin' 
                          ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                          : 'glass border-glass-border text-white rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-text-muted flex items-center gap-1 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white/2 border-t border-glass-border flex gap-2 lg:gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Your message..."
                  className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 lg:p-12 space-y-4">
              <div className="w-16 lg:w-20 h-16 lg:h-20 glass rounded-3xl flex items-center justify-center text-primary/20 mb-4">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-xl font-bold">Inbox</h2>
              <p className="text-text-muted max-w-xs text-sm">Select a conversation to start assisting visitors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatManager
