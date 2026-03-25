"use client"
import React, { useState, useEffect } from 'react'
import { Search, User, MessageSquare, Mail, Calendar, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { adminSupabase } from '@/lib/adminSupabase'
import { useRouter } from 'next/navigation'

const UserManagerPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const startChatWithUser = async (user) => {
    const { data: existingChat } = await adminSupabase
      .from('chats')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existingChat) {
      router.push(`/admin/chats?id=${existingChat.id}`)
    } else {
      const { data: newChat, error } = await adminSupabase
        .from('chats')
        .insert([{ 
          user_id: user.id, 
          subject: `Direct message to ${user.full_name || user.email}` 
        }])
        .select()
      
      if (newChat?.[0]) {
        router.push(`/admin/chats?id=${newChat[0].id}`)
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
    <div className="animate-fade-in text-left">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 uppercase italic text-slate-900">User <span className="text-primary">Management</span></h1>
          <p className="text-slate-500 font-medium">Manage registered customers and initiate direct support.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2 w-full md:w-auto shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full text-left"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase italic">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase italic">No users found matching your search.</div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                  {u.full_name?.[0] || u.email?.[0].toUpperCase()}
                </div>
                <button 
                  onClick={() => startChatWithUser(u)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                  title="Message User"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
              
              <h3 className="font-black text-slate-900 text-base mb-1 truncate uppercase tracking-tight">{u.full_name || 'Anonymous User'}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-4 italic">
                <Mail size={12} />
                <span className="truncate">{u.email}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserManagerPage
