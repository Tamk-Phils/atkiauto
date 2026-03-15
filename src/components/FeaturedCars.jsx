import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const vehicles = [
  { id: 1, name: 'Luminary S-Edition', type: 'Electric Sedan',     price: '$89,900',  image: '/car_1.png', badge: 'Electric' },
  { id: 2, name: 'Titan V8 Explorer',  type: 'Luxury SUV',         price: '$115,000', image: '/car_2.png', badge: 'Petrol' },
  { id: 3, name: 'Apex RS Coupe',      type: 'Sports Coupe',       price: '$145,000', image: '/car_3.png', badge: 'Manual' },
  { id: 4, name: 'Elysium Cabriolet',  type: 'Luxury Convertible', price: '$132,000', image: '/car_4.png', badge: 'Hybrid' },
]

const Card3D = ({ car, i }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
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
        rotateX: isMobile ? 0 : rotateX, 
        rotateY: isMobile ? 0 : rotateY, 
        scale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        cursor: 'pointer',
        position: 'relative',
      }}
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
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f8fafc' }}>
          <motion.img
            src={car.image} alt={car.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5 }}
          />
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
          }}>{car.badge}</div>
        </div>

        {/* Info – at a deeper Z layer to emphasize 3D */}
        <div style={{ padding: '1.5rem', transform: 'translateZ(20px)' }}>
          <p style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{car.type}</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0a0a0b', letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>{car.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.02em' }}>{car.price}</span>
            <Link to={`/inventory/${car.id}`} style={{
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

const FeaturedCars = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={{ padding: isMobile ? '5rem 0' : '7rem 0', background: '#fff', overflow: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end', 
          justifyContent: isMobile ? 'flex-start' : 'space-between', 
          gap: isMobile ? '2rem' : '0',
          marginBottom: isMobile ? '3rem' : '3.5rem' 
        }}>
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
            <Link to="/inventory" style={{
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

        {/* 3D Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: isMobile ? '1.5rem' : '1.75rem', 
          perspective: '1200px' 
        }}>
          {vehicles.map((car, i) => (
            <Card3D key={car.id} car={car} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCars
