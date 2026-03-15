import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, Users, Calendar, Settings, LogOut, Package, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Car size={20} />, label: 'Inventory', path: '/admin/inventory' },
    { icon: <Users size={20} />, label: 'Leads', path: '/admin/leads' },
    { icon: <MessageSquare size={20} />, label: 'Chats', path: '/admin/chats' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/admin/appointments' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-glass-border glass fixed h-full z-10">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Package className="text-white" size={16} />
            </div>
            <span className="font-black text-lg">ADMIN<span className="text-primary">PORTAL</span></span>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-primary transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
