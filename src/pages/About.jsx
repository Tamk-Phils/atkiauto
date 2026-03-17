import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Users, Wrench, MapPin, ArrowRight, Star, Shield, Clock } from 'lucide-react'

const stats = [
  { value: '28+', label: 'Years in Business' },
  { value: '8,200+', label: 'Happy Clients' },
  { value: '450+', label: 'Vehicles Sold' },
  { value: '4.9★', label: 'Google Rating' },
]

const team = [
  { name: 'James Attkisson', title: 'Founder & CEO', img: '/team_1.png', bio: 'With over three decades in the automotive industry, James built AttkissonAutos on a foundation of trust, quality, and straightforward service.' },
  { name: 'Sarah Mitchell', title: 'Head of Sales', img: '/team_2.png', bio: 'Sarah brings 15 years of experience in automotive sales, ensuring every client finds a reliable vehicle that fits their budget.' },
  { name: 'David Okafor', title: 'Chief Technician', img: '/team_3.png', bio: 'A master-certified mechanic with expertise in rigorous multi-point inspections and maintenance.' },
]

const values = [
  { icon: <Shield size={26} />, title: 'Integrity First', desc: 'Every vehicle is honestly represented. No hidden fees, no pressure — just transparent, trustworthy service.' },
  { icon: <Award size={26} />, title: 'Hand-Picked Quality', desc: 'Each car undergoes a rigorous 150-point inspection before it ever reaches our inventory.' },
  { icon: <Users size={26} />, title: 'Community-Focused', desc: 'Your satisfaction extends beyond the sale. We build relationships that last a lifetime.' },
  { icon: <Wrench size={26} />, title: 'Full Service', desc: 'Our certified technicians maintain your vehicle to the highest safety standards.' },
  { icon: <Clock size={26} />, title: 'Fast & Reliable', desc: 'Whether buying or servicing, we respect your time with efficient, straightforward processes.' },
  { icon: <Star size={26} />, title: 'Top Rated', desc: 'Recognized as a leading used car dealership in the region for six consecutive years running.' },
]

const milestones = [
  { year: '1996', event: 'Founded by James Attkisson with a small showroom and a big vision.' },
  { year: '2004', event: 'Expanded to our current flagship location in central Metropolis.' },
  { year: '2012', event: 'Launched our certified pre-owned program with 150-point inspections.' },
  { year: '2018', event: 'Introduced affordable hybrid & fuel-efficient options to the lot.' },
  { year: '2023', event: 'Surpassed 8,000 happy clients and opened our full-service centre.' },
]

const About = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ paddingTop: '5rem', background: '#fff', color: '#0a0a0b', minHeight: '100vh' }}>


      {/* ── Hero Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a20 100%)',
        padding: '7rem 0 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Since 1996
            </p>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
              fontWeight: 900, 
              color: '#fff', 
              letterSpacing: '-0.03em', 
              lineHeight: 1.05, 
              marginBottom: '1.5rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              AttkissonAutos —<br />Built on Trust
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.55)', 
              fontSize: '1.1rem', 
              lineHeight: 1.8, 
              maxWidth: isMobile ? '100%' : '500px', 
              marginBottom: '2.5rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              For nearly three decades, we've matched drivers with high-quality, reliable vehicles. Our story is one of trust, integrity, and an unwavering commitment to our community.
            </p>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Link to="/inventory" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: '#fff', color: '#0a0a0b',
                padding: '0.9rem 1.75rem', borderRadius: '0.625rem',
                fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.07em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                Browse Inventory
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#ef4444', padding: isMobile ? '3rem 0' : '2.5rem 0' }}>
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: isMobile ? '3rem' : '1rem', 
          textAlign: 'center' 
        }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: '0.25rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section style={{ padding: isMobile ? '5rem 0' : '7rem 0', background: '#f8fafc' }}>
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? '4rem' : '6rem', 
          alignItems: 'center' 
        }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our Story</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.75rem' }}>
              A Legacy Built on Every Mile
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                'AttkissonAutos was founded in 1996 by James Attkisson, an automotive expert who believed that buying a car should be simple, honest, and accessible to everyone.',
                'Starting with a modest lot of 12 vehicles in downtown Metropolis, James built a reputation for transparency and quality that still defines us today.',
                'Over the decades, we\'ve grown into a full-service dealership — offering hand-picked inventory, flexible financing solutions, and a comprehensive service centre — all under one roof.',
              ].map((p, i) => (
                <p key={i} style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.8 }}>{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', paddingBottom: i < milestones.length - 1 ? '2rem' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === milestones.length - 1 ? '#ef4444' : '#fff', border: `2px solid ${i === milestones.length - 1 ? '#ef4444' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: i === milestones.length - 1 ? '#fff' : '#0a0a0b', letterSpacing: '0.05em', flexShrink: 0 }}>{m.year}</div>
                  {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: '0.5rem' }} />}
                </div>
                <div style={{ paddingTop: '0.75rem' }}>
                  <p style={{ color: '#0a0a0b', fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 500 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section style={{ padding: '7rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What We Stand For</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em' }}>Our Core Values</h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: '2rem' 
          }}>
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ 
                  background: '#fff', 
                  borderRadius: '1rem', 
                  padding: '2rem', 
                  border: '1px solid #e2e8f0', 
                  transition: 'box-shadow 0.3s' 
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: 52, height: 52, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1.25rem' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0a0a0b', marginBottom: '0.6rem' }}>{v.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.75 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet the Team ── */}
      <section style={{ padding: '7rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>The People Behind It</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em' }}>Meet Our Team</h2>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: '2.5rem' 
          }}>
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: 240, background: '#f1f5f9', overflow: 'hidden' }}>
                  <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a0a0b', marginBottom: '0.25rem' }}>{member.name}</h3>
                  <p style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>{member.title}</p>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.75 }}>{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default About
