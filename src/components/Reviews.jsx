import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Marcus Sterling',
    role: 'Tech Entrepreneur',
    content: 'The level of service at AttkissonAutos is simply unmatched. I found my dream Apex RS in less than an hour. The process was seamless from start to finish.',
    rating: 5,
    initials: 'MS',
    color: '#ef4444',
    car: 'Apex RS Coupe',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Interior Designer',
    content: 'As someone who values aesthetics, I was blown away by both their inventory and showroom. The Luminary S-Edition I purchased is a masterpiece of engineering and design.',
    rating: 5,
    initials: 'ER',
    color: '#8b5cf6',
    car: 'Luminary S-Edition',
  },
  {
    name: 'James Wilson',
    role: 'Adventure Photographer',
    content: 'Found a rugged Titan V8 for my mountain expeditions. The team was incredibly helpful and answered every technical query about the engine\'s off-road capabilities.',
    rating: 4,
    initials: 'JW',
    color: '#0ea5e9',
    car: 'Titan V8 Explorer',
  },
]

const Reviews = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={{ padding: isMobile ? '5rem 0' : '7rem 0', background: '#f8fafc', overflow: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '4rem' }}>
          <p style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Elite Clientele
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            What Our <span style={{ color: '#ef4444' }}>Clients</span> Say
          </h2>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
            From entrepreneurs to creatives, our clients demand the best. Join the AttkissonAutos legacy.
          </p>
        </div>

        {/* Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
          gap: '2rem' 
        }}>
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                background: '#fff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Quote mark */}
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.75rem', color: '#ef4444', opacity: 0.08 }}>
                <Quote size={48} />
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.25rem' }}>
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={14}
                    fill={s < review.rating ? '#ef4444' : 'none'}
                    color={s < review.rating ? '#ef4444' : '#e2e8f0'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.8, flex: 1, marginBottom: '1.75rem', fontStyle: 'italic' }}>
                "{review.content}"
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                {/* Avatar initials */}
                <div style={{
                  width: 48, height: 48, borderRadius: '0.75rem', flexShrink: 0,
                  background: review.color + '18',
                  border: `2px solid ${review.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.875rem', color: review.color,
                  letterSpacing: '0.03em',
                }}>
                  {review.initials}
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0a0a0b', marginBottom: '0.125rem' }}>{review.name}</h4>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{review.role}</p>
                  <p style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Owns: {review.car}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reviews
