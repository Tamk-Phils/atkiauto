"use client"
import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// vehicles will be fetched from Supabase

const Card3D = ({ car, i }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [16, -16]), { stiffness: 180, damping: 24 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), { stiffness: 180, damping: 24 })
  const glowOpacity = useSpring(0, { stiffness: 150, damping: 20 })
  const scale = useSpring(1, { stiffness: 200, damping: 20 })

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleEnter = () => { glowOpacity.set(1); scale.set(1.03) }
  const handleLeave = () => { x.set(0); y.set(0); glowOpacity.set(0); scale.set(1) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: rotateX, 
        rotateY: rotateY, 
        scale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        cursor: 'pointer',
        position: 'relative',
      }}
      className="hidden lg:block"
    >
      {/* Glow highlight that follows cursor */}
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: '1rem',
        background: 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.15), transparent 60%)',
        opacity: glowOpacity, pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Card face */}
      <div style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'transform 0.3s, box-shadow 0.3s'
      }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f8fafc' }}>
          {(car.images?.length > 0 || car.image_url) ? (
            <motion.img
              src={car.images?.[0] || car.image_url} alt={`${car.make} ${car.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ImageIcon size={32} color="#cbd5e1" /></div>
          )}
          {/* Shine sweep on hover */}
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{
            position: 'absolute', top: '0.875rem', left: '0.875rem',
            background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.3rem 0.75rem', borderRadius: '999px',
            fontSize: '0.6rem', fontWeight: 800, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>{car.year} Model</div>
        </div>

        {/* Info – at a deeper Z layer to emphasize 3D */}
        <div style={{ padding: '1.5rem', transform: 'translateZ(20px)' }}>
          <p style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{car.type}</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a0a0b', letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>{car.make} {car.model}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em' }}>${parseInt(car.price || 0).toLocaleString()}</span>
            <Link href={`/inventory/${car.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.65rem', fontWeight: 800, color: '#ef4444',
              textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
            }}>
              Details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const MobileCard = ({ car }) => (
  <Link href={`/inventory/${car.id}`} className="block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
      <img src={car.images?.[0] || car.image_url} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-black text-slate-900">{car.make} {car.model}</h3>
        <span className="text-primary font-black">${parseInt(car.price || 0).toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{car.type}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">Details <ArrowRight size={10} /></span>
      </div>
    </div>
  </Link>
)

const FeaturedCars = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .limit(4)
      
      if (data) setVehicles(data)
      setLoading(false)
    }

    fetchVehicles()

    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}
            >
              Our Collection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              View Inventory
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/inventory" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
              fontSize: '0.7rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#0a0a0b', textDecoration: 'none', transition: 'all 0.2s',
            }}>
              Browse All <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:perspective-[1200px] min-h-[400px]">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading collection...</div>
          ) : vehicles.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Check back soon for new inventory!</div>
          ) : (
            vehicles.map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-full"
              >
                {/* 3D on Desktop, Simple on Mobile */}
                <div className="hidden lg:block"><Card3D car={car} i={i} /></div>
                <div className="block lg:hidden"><MobileCard car={car} /></div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCars
