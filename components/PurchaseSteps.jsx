"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Settings, Truck } from 'lucide-react';

const steps = [
  {
    icon: <Search size={32} />,
    title: 'Select',
    desc: 'Browse our extensive collection of reliable pre-owned vehicles.'
  },
  {
    icon: <MessageCircle size={32} />,
    title: 'Consult',
    desc: 'Speak with our team to find the perfect vehicle for your lifestyle and budget.'
  },
  {
    icon: <Settings size={32} />,
    title: 'Inspect',
    desc: 'Every car undergoes a rigorous 150-point inspection for your peace of mind.'
  },
  {
    icon: <Truck size={32} />,
    title: 'Drive',
    desc: 'Drive home today with easy financing and our comprehensive warranty.'
  }
];

const PurchaseSteps = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section style={{
      padding: isMobile ? '6rem 0' : '10rem 0',
      background: '#0a0a0b',
      color: '#fff',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '4rem' : '8rem' }}>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#ef4444',
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              marginBottom: '1.5rem'
            }}
          >
            A Seamless Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em'
            }}
          >
            How to Acquire your next <span style={{ color: '#ef4444' }}>Vehicle</span>
          </motion.h2>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: isMobile ? '4rem' : '4rem', 
          position: 'relative' 
        }}>
          {/* Progress Line */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.2), transparent)',
              zIndex: 0
            }} />
          )}

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  width: 80,
                  height: 80,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2.5rem',
                  color: '#ef4444',
                  boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)'
                }}
              >
                {step.icon}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: 30,
                  height: 30,
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  color: '#fff'
                }}>
                  {i + 1}
                </div>
              </motion.div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>{step.title}</h3>
              <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PurchaseSteps;
