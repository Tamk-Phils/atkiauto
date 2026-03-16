import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Car, Users, Calendar, Settings, LogOut, Package, MessageSquare, X, Menu, Ticket, UserCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminNotifier from './AdminNotifier'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024)
  const [showSidebar, setShowSidebar] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    if (isMobile) setShowSidebar(false)
  }, [location.pathname, isMobile])
  
  const handleSignOut = () => {
    localStorage.removeItem('admin_auth')
    navigate('/admin/login')
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Car size={20} />, label: 'Inventory', path: '/admin/inventory' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <MessageSquare size={20} />, label: 'Chats', path: '/admin/chats' },
    { icon: <UserCircle2 size={20} />, label: 'Leads', path: '/admin/leads' },
    { icon: <Ticket size={20} />, label: 'Reservations', path: '/admin/reservations' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/admin/appointments' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-[#050505] text-white max-w-full overflow-x-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-glass-border glass z-[60] px-6 flex items-center justify-between lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <Package className="text-white" size={16} />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase italic">
            ADMIN<span className="text-primary">PORTAL</span>
          </span>
        </Link>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white active:scale-90 transition-transform"
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile Only) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full z-[80] transition-transform duration-300 ease-out border-r border-glass-border
        bg-[#0a0a0b] lg:glass
        w-72 lg:w-64
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Package className="text-white" size={16} />
            </div>
            <span className="font-black text-lg uppercase tracking-tighter italic">
              ADMIN<span className="text-primary">PORTAL</span>
            </span>
          </Link>

          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3.5 text-text-muted hover:text-primary transition-colors w-full group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm tracking-wide uppercase">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 sm:p-6 lg:p-12 pt-24 lg:pt-12 min-h-screen relative">
        <div className="fixed bottom-6 right-6 top-auto lg:top-12 lg:bottom-auto z-[100]">
          <AdminNotifier />
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
