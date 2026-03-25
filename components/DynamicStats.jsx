import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const stats = [
  { label: 'Vehicles Sold', value: 8200, suffix: '+' },
  { label: 'Global Offices', value: 14, suffix: '' },
  { label: 'Performance Records', value: 42, suffix: '' },
  { label: 'Client Satisfaction', value: 99, suffix: '%' }
];

const DynamicStats = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={{
      padding: isMobile ? '6rem 0' : '12rem 0',
      background: 'radial-gradient(circle at 50% 50%, #1a1a24 0%, #0a0a0b 100%)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container relative z-10">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: isMobile ? '3rem' : '4rem' 
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              style={{ textAlign: 'center' }}
            >
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{
                  fontSize: isMobile ? '3rem' : '5rem',
                  fontWeight: 950,
                  color: '#ef4444',
                  letterSpacing: '-0.05em',
                  marginBottom: '1rem',
                  lineHeight: 1
                }}
              >
                {stat.value}{stat.suffix}
              </motion.h3>
              <div style={{
                height: '2px',
                width: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                margin: '0 auto 1.5rem'
              }} />
              <p style={{
                fontSize: isMobile ? '0.7rem' : '0.9rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: isMobile ? '0.2em' : '0.3em'
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: isMobile ? '6rem' : '10rem', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: isMobile ? '2.5rem 1.5rem' : '3rem',
              borderRadius: '2.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              maxWidth: '900px',
              margin: '0 auto'
            }}
          >
            <h4 style={{ 
              fontSize: isMobile ? '1.1rem' : '1.5rem', 
              fontWeight: 800, 
              marginBottom: '1.5rem', 
              fontStyle: 'italic',
              lineHeight: 1.5 
            }}>
              "Engineering is not just about numbers, it's about the soul of the machine."
            </h4>
            <p style={{ color: '#ef4444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
              — Philip Attkisson, Founder
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DynamicStats;
