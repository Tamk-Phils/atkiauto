import React, { useState, useEffect } from 'react'
import { motion, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/* ── No longer using Orb or TiltCard for a cleaner look ── */

const Hero = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [count0, setCount0] = useState(0)
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)

  useEffect(() => {
    const c0 = animate(0, 450, { duration: 2.5, onUpdate: v => setCount0(Math.round(v)) })
    const c1 = animate(0, 8200, { duration: 2.8, onUpdate: v => setCount1(Math.round(v)) })
    const c2 = animate(0, 28,   { duration: 2.0, onUpdate: v => setCount2(Math.round(v)) })
    return () => { c0.stop(); c1.stop(); c2.stop() }
  }, [])

  const containerStyle = {
    position: 'relative',
    minHeight: '92vh',
    background: 'radial-gradient(ellipse 80% 60% at 60% 40%, #161620 0%, #0a0a0b 100%)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? '7rem 1.5rem 4rem' : '5rem 0',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '4rem' : '3rem',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  };

  return (
    <section style={containerStyle}>
      {/* Deep background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Simplified background glow */}
      <div style={{
        position: 'absolute', top: '10%', right: '10%',
        width: '40%', height: '40%', background: 'rgba(239,68,68,0.1)',
        filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div className="container" style={gridStyle}>

        {/* ── Left Text ── */}
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '2rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Reliable Quality · Est. 1996
              </span>
            </motion.div>
 
            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
              fontWeight: 900, color: '#fff', lineHeight: 1.0,
              letterSpacing: '-0.035em', marginBottom: '1.5rem'
            }}>
              Driven by <br />
              <span style={{
                color: '#ef4444'
              }}>
                Reliability
              </span>
            </h1>
 
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                color: isMobile ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)',
                fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                lineHeight: 1.8,
                maxWidth: isMobile ? '100%' : '380px',
                margin: isMobile ? '0 auto 2.5rem' : '0 0 2.5rem',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Hand-picked, certified pre-owned vehicles. Quality transportation for those who value trust and longevity.
            </motion.p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <Link to="/inventory" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: '#ef4444', color: '#fff',
                padding: '1rem 2rem', borderRadius: '0.75rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.07em',
                textTransform: 'uppercase', textDecoration: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 10px 20px rgba(239,68,68,0.3)',
              }}>
                View Inventory
                <ArrowRight size={16} />
              </Link>

              <Link to="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '1rem 2rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.07em',
                textTransform: 'uppercase', textDecoration: 'none',
                transition: 'all 0.3s',
              }}>
                Our Story
              </Link>
            </div>

            {/* Animated stats */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '1.5rem' : '2.5rem',
              marginTop: '3.5rem',
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap'
            }}>
              {[
                { value: `${count0}+`, label: 'Vehicles' },
                { value: count1.toLocaleString(), label: 'Clients' },
                { value: `${count2}yr`,  label: 'Legacy' },
              ].map((stat, i) => (
                <div key={i} style={{
                  borderLeft: (!isMobile && i > 0) ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  paddingLeft: (!isMobile && i > 0) ? '2.5rem' : 0,
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right: Car ── */}
        <div style={{ 
          position: isMobile ? 'relative' : 'relative',
          marginTop: isMobile ? '-2rem' : '0',
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}
          >
            <img
              src="/hero_used_cars.png"
              alt="Quality Pre-owned Vehicles"
              style={{
                width: isMobile ? '100%' : '120%',
                maxWidth: isMobile ? '100%' : '700px',
                height: 'auto',
                display: 'block',
                borderRadius: isMobile ? '0' : '1.5rem',
                filter: isMobile ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' : 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
              }}
            />

            {/* Subtle Gradient Mask for mobile readability */}
            {isMobile && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, #0a0a0b, transparent)',
                opacity: 0.8
              }} />
            )}

            {/* Static Badges for simplified UI */}
            {!isMobile && (
              <>
                <div style={{
                  position: 'absolute', top: '15%', right: '5%',
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem', padding: '0.75rem 1rem',
                  zIndex: 3
                }}>
                   <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Selection</div>
                   <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 900 }}>450+ <span style={{ color: '#ef4444' }}>Vehicles</span></div>
                </div>
                <div style={{
                  position: 'absolute', bottom: '20%', left: '5%',
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem', padding: '0.75rem 1rem',
                  zIndex: 3
                }}>
                   <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Warranty</div>
                   <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 900 }}>12 <span style={{ color: '#ef4444' }}>Months</span></div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
