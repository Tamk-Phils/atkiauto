import React, { useState, useEffect } from 'react'
import { Search, User, MessageSquare, Mail, Calendar, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'
import { useNavigate } from 'react-router-dom'

const cardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1.5rem',
}

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    // Fetch profiles which are linked to auth.users
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const startChatWithUser = async (user) => {
    // Check if a chat already exists for this user
    const { data: existingChat } = await adminSupabase
      .from('chats')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existingChat) {
      navigate(`/admin/chats`, { state: { openChatId: existingChat.id } })
    } else {
      // Create new chat
      const { data: newChat, error } = await adminSupabase
        .from('chats')
        .insert([{ 
          user_id: user.id, 
          subject: `Direct message to ${user.full_name || user.email}` 
        }])
        .select()
      
      if (newChat?.[0]) {
        navigate(`/admin/chats`, { state: { openChatId: newChat[0].id } })
      } else {
        alert('Failed to initiate chat: ' + (error?.message || 'Unknown error'))
      }
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black mb-2">User <span className="text-primary">Management</span></h1>
          <p className="text-text-muted">Manage registered customers and initiate direct support.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-xl px-4 py-2 w-full md:w-auto">
          <Search size={18} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#0a0a0b] w-full"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-text-muted">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-text-muted">No users found matching your search.</div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} style={cardStyle} className="group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  {u.full_name?.[0] || u.email?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={() => startChatWithUser(u)}
                  className="p-2 bg-white border border-[#e2e8f0] rounded-lg text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
                  title="Message User"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
              
              <h3 className="font-bold text-[#0a0a0b] text-base mb-1 truncate">{u.full_name || 'Anonymous User'}</h3>
              <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
                <Mail size={12} />
                <span className="truncate">{u.email}</span>
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.08)', borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Active</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserManager
