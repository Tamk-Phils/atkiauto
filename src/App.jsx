import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import CarDetail from './pages/CarDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Finance from './pages/Finance'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import InventoryManager from './admin/InventoryManager'
import LeadManager from './admin/LeadManager'
import AppointmentManager from './admin/AppointmentManager'
import Settings from './admin/Settings'
import ChatManager from './admin/ChatManager'
import AdminLogin from './admin/AdminLogin'
import UserManager from './admin/UserManager'
import ReservationManager from './admin/ReservationManager'
import FinanceManager from './admin/FinanceManager'
import ProtectedRoute from './admin/ProtectedRoute'
import Auth from './pages/Auth'
import UserDashboard from './pages/UserDashboard'
import Navbar from './components/Navbar'
import Chat from './components/Chat'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:id" element={<CarDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="leads" element={<LeadManager />} />
              <Route path="finance" element={<FinanceManager />} />
              <Route path="appointments" element={<AppointmentManager />} />
              <Route path="chats" element={<ChatManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="reservations" element={<ReservationManager />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
        <Chat />
      </div>
    </Router>
  )
}

export default App
