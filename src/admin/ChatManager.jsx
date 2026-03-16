import React, { useState, useEffect, useRef } from 'react'
import { Search, MessageSquare, User, Send, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'
import { useLocation } from 'react-router-dom'

const ChatManager = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [profiles, setProfiles] = useState({}) // Cache for user profiles
  const processedRedirection = useRef(false) // One-time flag
  const location = useLocation()
  const scrollRef = useRef()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initial fetch and global subscriptions
  useEffect(() => {
    console.log('ChatManager MOUNTED')
    fetchChats()

    // 1. Listen for ALL chat changes (new chats, status updates)
    const chatSub = adminSupabase
      .channel('admin_global_chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, () => {
        console.log('Chat list update detected via Realtime')
        fetchChats()
      })
      .subscribe((status) => console.log('Chat list subscription status:', status))

    // 2. Listen for ALL new messages (crucial for "user sent message" visibility)
    const msgSub = adminSupabase
      .channel('admin_global_messages_listener')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        console.log('GLOBAL MESSAGE RECEIVED:', payload)
        // Refresh list to show latest message at top/sort by last_message_at
        fetchChats()
      })
      .subscribe((status) => console.log('Global message listener status:', status))

    return () => {
      console.log('ChatManager UNMOUNTING - Cleaning up global subscriptions')
      adminSupabase.removeChannel(chatSub)
      adminSupabase.removeChannel(msgSub)
    }
  }, [])

  // Process redirection from location state ONCE
  useEffect(() => {
    const targetChatId = location.state?.openChatId
    if (!targetChatId || processedRedirection.current) return

    // Wait until initial fetch finishes
    if (!loading) {
      console.log('Attempting redirection to targetChatId:', targetChatId)
      const found = chats.find(c => c.id === targetChatId)
      
      if (found) {
        console.log('Found redirected chat in list')
        setSelectedChat(found)
        processedRedirection.current = true
      } else {
        console.log('Redirection target not in list, fetching specifically')
        fetchSpecificChat(targetChatId)
        processedRedirection.current = true
      }
    }
  }, [loading, chats, location.state?.openChatId])

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      console.log('Switching message subscription to chat:', selectedChat.id)
      setMessages([]) // Clear previous messages immediately
      fetchMessages(selectedChat.id)
      
      const sub = adminSupabase
        .channel(`admin_messages_for_${selectedChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        }, (payload) => {
          console.log('NEW MESSAGE IN SELECTED CHAT:', payload)
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          // List will already refresh due to global listener
        })
        .subscribe((status) => console.log(`Subscription for chat ${selectedChat.id}:`, status))

      return () => {
        console.log(`Cleaning up message subscription for ${selectedChat.id}`)
        adminSupabase.removeChannel(sub)
      }
    }
  }, [selectedChat?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const hasLastMessageAt = useRef(true) // Cache schema state

  const fetchChats = async () => {
    setLoading(true)
    
    let rawChats = null
    let error = null

    // Only try last_message_at if we haven't confirmed it's missing
    if (hasLastMessageAt.current) {
      const result = await adminSupabase
        .from('chats')
        .select('*')
        .order('last_message_at', { ascending: false })
      
      if (result.error && result.error.code === '42703') {
        hasLastMessageAt.current = false
        console.warn('last_message_at column missing, falling back to created_at permanently for this session')
      } else {
        rawChats = result.data
        error = result.error
      }
    }
    
    // Fallback if column is confirmed missing or first attempt failed with missing column error
    if (!hasLastMessageAt.current) {
      const fallback = await adminSupabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
      rawChats = fallback.data
      error = fallback.error
    }
    
    if (error) {
      console.error('Error fetching chats:', error)
    } else if (rawChats) {
      setChats(rawChats)
      const userIds = [...new Set(rawChats.map(c => c.user_id).filter(Boolean))]
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

  const fetchSpecificChat = async (chatId) => {
    const { data } = await adminSupabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle()
    
    if (data) {
      setSelectedChat(data)
      if (data.user_id && !profiles[data.user_id]) {
        fetchProfiles([data.user_id])
      }
    }
  }

  const fetchMessages = async (chatId) => {
    const { data } = await adminSupabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const content = newMessage.trim()
    setNewMessage('') // Clear immediately for UX

    const messageObj = {
      chat_id: selectedChat.id,
      sender: 'admin',
      content
    }

    const { data: inserted, error } = await adminSupabase
      .from('messages')
      .insert([messageObj])
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore text on error
      if (error.code === '400' || error.message?.includes('trigger')) {
        alert('Database Error: The message trigger failed. Please run the SQL fix provided in the admin guide.')
      } else {
        alert(`Failed to send message: ${error.message || 'Unknown error'}`)
      }
    } else if (inserted) {
      // Optimistically add to list if subscription hasn't caught it yet
      setMessages(prev => {
        if (prev.find(m => m.id === inserted.id)) return prev
        return [...prev, inserted]
      })
      fetchChats() // update sorting
    }
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
                  <h4 className="font-bold text-sm truncate">
                    {profiles[chat.user_id]?.full_name || chat.profiles?.full_name || `Guest_${chat.id.slice(0, 5)}`}
                  </h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-tighter">
                    {profiles[chat.user_id]?.email || chat.profiles?.email || chat.status}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window - removed w-full to prevent flex conflict */}
        <div className={`
          flex-1 glass-card flex flex-col overflow-hidden
          ${isMobile && !selectedChat ? 'hidden' : 'h-full'}
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
                    <h3 className="font-bold text-sm">
                      {profiles[selectedChat.user_id]?.full_name || selectedChat.profiles?.full_name || `Guest_${selectedChat.id.slice(0, 5)}`}
                    </h3>
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
                          : 'bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-tl-none'
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
