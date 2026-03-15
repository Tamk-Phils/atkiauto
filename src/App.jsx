import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import CarDetail from './pages/CarDetail'
import About from './pages/About'
import Service from './pages/Service'
import Contact from './pages/Contact'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import InventoryManager from './admin/InventoryManager'
import LeadManager from './admin/LeadManager'
import AppointmentManager from './admin/AppointmentManager'
import Settings from './admin/Settings'
import ChatManager from './admin/ChatManager'
import AdminLogin from './admin/AdminLogin'
import ProtectedRoute from './admin/ProtectedRoute'
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
            <Route path="/service" element={<Service />} />
            <Route path="/contact" element={<Contact />} />
            
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
              <Route path="appointments" element={<AppointmentManager />} />
              <Route path="chats" element={<ChatManager />} />
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
