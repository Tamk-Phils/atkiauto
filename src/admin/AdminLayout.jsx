import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, Users, Calendar, Settings, LogOut, Package, MessageSquare, X, Menu } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-glass-border glass z-[30] px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Package className="text-white" size={12} />
            </div>
            <span className="font-black text-sm tracking-tighter">ADMIN</span>
          </Link>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
      )}

      {/* Sidebar Overlay */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed h-full z-[50] transition-transform duration-300 ease-out border-r border-glass-border glass
        ${isMobile ? 'w-[280px]' : 'w-64'}
        ${isMobile && !showSidebar ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Package className="text-white" size={16} />
            </div>
            <span className="font-black text-lg uppercase tracking-tighter italic">
              ADMIN<span className="text-primary">PORTAL</span>
            </span>
          </Link>

          <nav className="space-y-1.5">
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
      <main className={`
        flex-1 transition-all duration-300
        ${isMobile ? 'ml-0 p-6 pt-24' : 'ml-64 p-12'}
      `}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
