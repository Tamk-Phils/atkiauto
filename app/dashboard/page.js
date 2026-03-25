"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Package, MessageSquare, LogOut, Calendar, Car } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const DashboardCard = ({ title, icon: Icon, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1.25rem',
    padding: '1.50rem',
    height: '100%'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.75rem', color: '#ef4444' }}>
        <Icon size={20} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
    {children}
  </div>
)

const UserDashboardPage = () => {
  const [user, setUser] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      // Fetch reservations
      const { data: resData } = await supabase
        .from('reservations')
        .select(`
          *,
          cars (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      if (resData) setReservations(resData)
      setLoading(false)
    }

    fetchUserAndData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading Dashboard...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Welcome, <span style={{ color: '#ef4444' }}>{user?.user_metadata?.full_name || 'Driver'}</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Manage your account and track your vehicle reservations.</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Profile Section */}
          <DashboardCard title="Profile Information" icon={User}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                <div style={{ color: '#fff', fontSize: '0.95rem' }}>{user?.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Account Status</label>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} /> Verified
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Activity Section */}
          <DashboardCard title="Recent Reservations" icon={Package}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.3)' }}>
                <Car size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No active reservations.</p>
                <button 
                  onClick={() => router.push('/inventory')}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, marginTop: '1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Browse Inventory
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reservations.map(res => (
                  <div key={res.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{res.cars?.year} {res.cars?.make} {res.cars?.model}</h4>
                      <span style={{ fontSize: '0.6rem', color: res.payment_status === 'paid' ? '#4ade80' : '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                        {res.payment_status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {new Date(res.created_at).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>Fee: ${res.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Support Section */}
          <DashboardCard title="Direct Support" icon={MessageSquare}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Have questions about your reservation or need more details on a vehicle? Chat directly with our sales team.
            </p>
            <button 
              onClick={() => {
                window.dispatchEvent(new Event('openChat'))
              }}
              style={{ 
                width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.75rem',
                fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              Open Live Chat
            </button>
          </DashboardCard>

        </div>
      </div>
    </div>
  )
}

export default UserDashboardPage
