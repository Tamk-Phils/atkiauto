"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ArrowRight, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
  fontSize: '0.875rem', fontFamily: 'inherit',
  background: '#fff', color: '#0f172a', outline: 'none',
  transition: 'border-color 0.2s',
}

const InventoryPage = () => {
  const [allCars, setAllCars] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [carTypes, setCarTypes] = useState(['All'])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ── Fetch from Supabase and subscribe to changes ── */
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      if (error) { console.error(error); setLoading(false); return }
      const list = data ?? []
      setAllCars(list)
      // Derive unique types from actual data
      const types = ['All', ...new Set(list.map(c => c.type).filter(Boolean))]
      setCarTypes(types)
      setLoading(false)
    }
    fetch()

    const channel = supabase.channel('rt-inventory-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, () => fetch())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  /* ── Filter in memory ── */
  useEffect(() => {
    let filtered = allCars
    if (searchTerm) {
      filtered = filtered.filter(c =>
        `${c.make} ${c.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterType !== 'All') {
      filtered = filtered.filter(c => c.type === filterType)
    }
    setCars(filtered)
  }, [searchTerm, filterType, allCars])

  const getImage = (car) => {
    if (car.images?.length > 0) return car.images[0]
    if (car.image_url) return car.image_url
    return null
  }

  return (
    <div style={{ paddingTop: isMobile ? '2rem' : '4rem', paddingBottom: '5rem', minHeight: '100vh', background: '#f8fafc', color: '#0a0a0b' }}>
      <div className="container">
        {/* Filters */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '1rem', 
          border: '1px solid #e2e8f0', 
          padding: isMobile ? '1.25rem' : '1.5rem', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap', 
          gap: '1rem', 
          alignItems: 'center', 
          marginBottom: '2.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search make or model..."
              style={{ ...inputStyle, paddingLeft: '2.75rem' }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative', width: isMobile ? '100%' : '200px' }}>
            <select style={{ ...inputStyle, appearance: 'none', paddingRight: '2.5rem', cursor: 'pointer' }}
              value={filterType} onChange={e => setFilterType(e.target.value)}>
              {carTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Count */}
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em' }}>
          {loading ? 'Loading…' : `${cars.length} vehicle${cars.length !== 1 ? 's' : ''} available`}
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ height: 220, background: '#f1f5f9' }} />
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 10, width: '60%' }} />
                  <div style={{ height: 20, background: '#f1f5f9', borderRadius: 4, marginBottom: 16, width: '80%' }} />
                  <div style={{ height: 36, background: '#f1f5f9', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            <AnimatePresence mode="popLayout">
              {cars.map((car) => {
                const img = getImage(car)
                return (
                  <motion.div key={car.id} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#f8fafc' }}>
                      {img ? (
                        <img src={img} alt={`${car.make} ${car.model}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                          <ImageIcon size={40} />
                          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>No image</p>
                        </div>
                      )}
                      {car.images?.length > 1 && (
                        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.6rem', fontWeight: 800 }}>
                          +{car.images.length - 1} photos
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {car.year}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '1.75rem' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{car.type}</p>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{car.make} {car.model}</h3>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>${parseInt(car.price || 0).toLocaleString()}</p>

                      {/* Specs */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', padding: '1rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
                        {[{ label: 'Fuel', val: car.fuel }, { label: 'Miles', val: car.mileage }, { label: 'Trans', val: car.transmission }].map(s => (
                          <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>{s.label}</div>
                            <div style={{ color: '#0a0a0b', fontSize: '0.75rem', fontWeight: 800 }}>{s.val || '—'}</div>
                          </div>
                        ))}
                      </div>

                      <Link href={`/inventory/${car.id}`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#ef4444', color: '#fff',
                        padding: '0.6rem 1rem', borderRadius: '0.625rem',
                        fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', textDecoration: 'none',
                        boxShadow: '0 6px 12px rgba(239,68,68,0.15)',
                        transition: 'all 0.2s'
                      }}
                      >
                        Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* No results */}
        {!loading && cars.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '0.75rem' }}>
              {allCars.length === 0 ? 'No vehicles in inventory yet' : 'No vehicles match your search'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {allCars.length === 0 ? 'Check back soon — our team is always adding new stock.' : 'Try adjusting your filters.'}
            </p>
            {allCars.length > 0 && (
              <button onClick={() => { setSearchTerm(''); setFilterType('All') }}
                style={{ background: '#ef4444', color: '#fff', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryPage
