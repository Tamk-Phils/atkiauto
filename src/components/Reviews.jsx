import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Mark Henderson',
    role: 'Local High School Teacher',
    content: 'Bought a used Honda Accord for my daily commute. The team at AttkissonAutos made the financing simple and transparent. The car runs like a dream.',
    rating: 5,
    initials: 'MH',
    color: '#ef4444',
    car: 'Honda Accord 2019',
    image: '/customer_1.png'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Pediatric Nurse',
    content: 'I needed a reliable SUV for my growing family. The Chevy Tahoe I found here was in pristine condition. Highly recommend their certified pre-owned program.',
    rating: 5,
    initials: 'SJ',
    color: '#8b5cf6',
    car: 'Chevrolet Tahoe 2021',
    image: '/customer_2.png'
  },
  {
    name: 'David Miller',
    role: 'Graphic Designer',
    content: 'Found a great deal on a Mercedes C-Class. It looks brand new despite being pre-owned. The 12-month warranty really gave me peace of mind.',
    rating: 5,
    initials: 'DM',
    color: '#0ea5e9',
    car: 'Mercedes-Benz C-Class',
    image: '/customer_3.png'
  },
  {
    name: 'Robert Wilson',
    role: 'Small Business Owner',
    content: 'The reservation process was seamless. I chatted with the admin, paid the reservation fee, and the truck was ready for me to inspect the next day. A truly trustworthy dealership.',
    rating: 5,
    initials: 'RW',
    color: '#f59e0b',
    car: 'Ford F-150 Lariat',
    image: '/customer_4.png'
  },
  {
    name: 'Emily Chen',
    role: 'Independent Architect',
    content: 'The user dashboard is so convenient! I could track my reservation and message the sales team directly. Transparent pricing and no hidden fees.',
    rating: 5,
    initials: 'EC',
    color: '#10b981',
    car: 'Tesla Model 3',
    image: '/customer_5.png'
  }
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
            Happy Customers
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            What Our <span style={{ color: '#ef4444' }}>Clients</span> Say
          </h2>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
            From local professionals to business owners, our clients value reliability. Join the AttkissonAutos family.
          </p>
        </div>

        {/* Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', 
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
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '0.75rem', flexShrink: 0,
                  background: review.color + '18',
                  border: `2px solid ${review.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.875rem', color: review.color,
                  letterSpacing: '0.03em',
                  overflow: 'hidden'
                }}>
                  {review.image ? (
                    <img src={review.image} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    review.initials
                  )}
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
