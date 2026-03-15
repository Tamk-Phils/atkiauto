import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/* ── Floating 3D Orb ── */
const Orb = ({ size, x, y, delay, color }) => (
  <motion.div
    style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: color,
      filter: 'blur(60px)',
      pointerEvents: 'none',
    }}
    animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

/* ── 3D Tilt Card wrapper ── */
const TiltCard = ({ children, style }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 })

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    x.set(nx); y.set(ny)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}

const Hero = () => {
  const heroRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  /* Smooth spring cursor values */
  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 })

  /* Parallax layers */
  const carX = useTransform(springX, [-500, 500], [-18, 18])
  const carY = useTransform(springY, [-300, 300], [-10, 10])
  const orb1X = useTransform(springX, [-500, 500], [-40, 40])
  const orb1Y = useTransform(springY, [-300, 300], [-25, 25])
  const textX = useTransform(springX, [-500, 500], [-6, 6])

  /* Car 3D tilt */
  const carRotY = useSpring(useTransform(springX, [-500, 500], [-10, 10]), { stiffness: 80, damping: 22 })
  const carRotX = useSpring(useTransform(springY, [-300, 300], [6, -6]),  { stiffness: 80, damping: 22 })

  const handleMouseMove = (e) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  const [count0, setCount0] = useState(0)
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)

  useEffect(() => {
    const c0 = animate(0, 450, { duration: 2.5, onUpdate: v => setCount0(Math.round(v)) })
    const c1 = animate(0, 8200, { duration: 2.8, onUpdate: v => setCount1(Math.round(v)) })
    const c2 = animate(0, 28,   { duration: 2.0, onUpdate: v => setCount2(Math.round(v)) })
    return () => { c0.stop(); c1.stop(); c2.stop() }
  }, [])

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        minHeight: '92vh',
        background: 'radial-gradient(ellipse 80% 60% at 60% 40%, #161620 0%, #0a0a0b 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '5rem',
        cursor: 'none',
      }}
    >
      {/* Custom cursor */}
      <motion.div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        width: 14, height: 14, borderRadius: '50%',
        background: '#ef4444',
        x: useTransform(springX, v => v + (heroRef.current?.getBoundingClientRect()?.left ?? 0) + (heroRef.current?.getBoundingClientRect()?.width ?? 0) / 2 - 7),
        y: useTransform(springY, v => v + (heroRef.current?.getBoundingClientRect()?.top ?? 0) + (heroRef.current?.getBoundingClientRect()?.height ?? 0) / 2 - 7),
      }} />

      {/* Deep background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Floating orbs — parallax layer 1 */}
      <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', x: orb1X, y: orb1Y }}>
        <Orb size={500} x="55%" y="-10%" delay={0}   color="rgba(239,68,68,0.08)" />
        <Orb size={350} x="10%" y="40%"  delay={2}   color="rgba(239,68,68,0.05)" />
        <Orb size={250} x="80%" y="60%"  delay={1.5} color="rgba(100,100,200,0.04)" />
      </motion.div>

      {/* Floating geometric shapes */}
      {[
        { w: 80, h: 80, top: '18%', left: '6%',  rotate: 20,  delay: 0 },
        { w: 50, h: 50, top: '70%', left: '12%', rotate: -15, delay: 1 },
        { w: 60, h: 60, top: '25%', left: '88%', rotate: 35,  delay: 0.5 },
        { w: 40, h: 40, top: '75%', left: '82%', rotate: -30, delay: 1.5 },
      ].map((s, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.w, height: s.h,
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: '12px',
            rotate: s.rotate,
            pointerEvents: 'none',
          }}
          animate={{ y: [0, -16, 0], rotate: [s.rotate, s.rotate + 8, s.rotate] }}
          transition={{ duration: 7 + i, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Main Container */}
      <div className="container" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', width: '100%' }}>

        {/* ── Left Text ── */}
        <motion.div style={{ x: textX }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '2rem',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}
              />
              <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Premium Dealership · Est. 1996
              </span>
            </motion.div>

            {/* Headline with per-word stagger */}
            <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              {['Beyond', 'Excellence'].map((word, i) => (
                <motion.div key={i}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
                    fontWeight: 900, color: '#fff', lineHeight: 1.0,
                    letterSpacing: '-0.035em', display: 'block',
                  }}
                >
                  {i === 1 ? (
                    <span style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #fb923c 50%, #ef4444 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {word}
                    </span>
                  ) : word}
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8 }}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '380px', marginBottom: '2.5rem' }}
            >
              The world's most curated automotive collection. Engineered for those who demand perfection in every mile.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <TiltCard style={{ borderRadius: '0.75rem' }}>
                <Link to="/inventory" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.875rem',
                  background: '#fff', color: '#0a0a0b',
                  padding: '1rem 2rem', borderRadius: '0.75rem',
                  fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.07em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(255,255,255,0.12)',
                }}>
                  View Inventory
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={14} color="#fff" />
                  </div>
                </Link>
              </TiltCard>

              <TiltCard style={{ borderRadius: '0.75rem' }}>
                <Link to="/about" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.875rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.8)',
                  padding: '1rem 2rem', borderRadius: '0.75rem',
                  fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.07em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                }}>
                  Our Story
                </Link>
              </TiltCard>
            </motion.div>

            {/* Animated stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              style={{ display: 'flex', gap: '2.5rem', marginTop: '3.5rem' }}
            >
              {[
                { value: `${count0}+`, label: 'Vehicles' },
                { value: count1.toLocaleString(), label: 'Happy Clients' },
                { value: `${count2}yr`,  label: 'Experience' },
              ].map((stat, i) => (
                <div key={i} style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingLeft: i > 0 ? '2.5rem' : 0 }}>
                  <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right: 3D Car ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Glowing ring behind car */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', width: '75%', height: '75%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* 3D Rotating Platform Ring */}
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: '85%', height: '85%',
              borderRadius: '50%',
              border: '1px dashed rgba(239,68,68,0.2)',
            }}
          />
          <motion.div
            animate={{ rotateZ: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: '70%', height: '70%',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          />

          {/* The Car — 3D parallax + tilt */}
          <motion.div
            style={{ x: carX, y: carY, rotateY: carRotY, rotateX: carRotX, transformStyle: 'preserve-3d', perspective: 1200 }}
            initial={{ opacity: 0, scale: 0.85, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/hero_car_luxury.png"
              alt="Luxury Vehicle"
              style={{
                width: '120%',
                maxWidth: '680px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(239,68,68,0.12))',
                position: 'relative', zIndex: 2,
                pointerEvents: 'none',
              }}
            />

            {/* Floating spec badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '10%', right: '-5%',
                background: 'rgba(10,10,11,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem', padding: '0.875rem 1.125rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 3,
              }}
            >
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Top Speed</div>
              <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 900, letterSpacing: '-0.02em' }}>320 <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>km/h</span></div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '18%', left: '-8%',
                background: 'rgba(10,10,11,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem', padding: '0.875rem 1.125rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 3,
              }}
            >
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>0–100 km/h</div>
              <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 900, letterSpacing: '-0.02em' }}>2.8 <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>sec</span></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            animate={i === 0 ? { width: 28, background: '#ef4444' } : { width: 8, background: 'rgba(255,255,255,0.2)' }}
            style={{ height: 6, borderRadius: 999 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
