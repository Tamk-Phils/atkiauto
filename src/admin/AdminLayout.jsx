import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, Users, Calendar, Settings, LogOut, Package, MessageSquare, X, Menu, Ticket, UserCircle2 } from 'lucide-react'
import AdminNotifier from './AdminNotifier'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    // Close sidebar on mobile route change
    if (window.innerWidth < 1024) {
      setShowSidebar(false)
    }
  }, [location.pathname])

  const handleSignOut = () => {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin/login')
  }

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin' },
    { icon: <Car size={18} />, label: 'Inventory', path: '/admin/inventory' },
    { icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
    { icon: <MessageSquare size={18} />, label: 'Chats', path: '/admin/chats' },
    { icon: <UserCircle2 size={18} />, label: 'Leads', path: '/admin/leads' },
    { icon: <Ticket size={18} />, label: 'Reservations', path: '/admin/reservations' },
    { icon: <Calendar size={18} />, label: 'Appointments', path: '/admin/appointments' },
    { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Overlay (Mobile Only) */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="text-white" size={16} />
              </div>
              <span className="font-black text-sm tracking-tighter uppercase italic">
                ADMIN<span className="text-primary">PORTAL</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors hover:bg-red-50 rounded-xl"
            >
              <LogOut size={18} />
              SIGN OUT
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 max-w-full overflow-hidden transition-all duration-300 ${showSidebar ? 'lg:pl-64' : 'pl-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="hidden xs:block font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Attkisson <span className="text-primary not-italic">Autos</span></h2>
          </div>

          <div className="flex items-center gap-4">
            <AdminNotifier />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto w-full overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
