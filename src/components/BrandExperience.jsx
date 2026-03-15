import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Cpu } from 'lucide-react';

const blocks = [
  {
    icon: <Zap size={48} />,
    title: 'Pure Performance',
    description: "Our vehicles aren't just transport—they're instruments of precision. From 0-100 in record time, engineered for the absolute purist.",
    accent: '#ef4444'
  },
  {
    icon: <Cpu size={48} />,
    title: 'Precision Engineering',
    description: "Every micron matters. We source vehicles that represent the pinnacle of automotive technology and digital innovation.",
    accent: '#ef4444'
  },
  {
    icon: <Target size={48} />,
    title: 'Bespoke Service',
    description: "Your journey is unique. Our consultation process ensures that every detail, from stitching to software, is tailored to your legacy.",
    accent: '#ef4444'
  }
];

const BrandExperience = () => {
  return (
    <section style={{
      padding: '10rem 0',
      background: '#fff',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8rem', marginBottom: '8rem', alignItems: 'center' }}>
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                marginBottom: '1.5rem'
              }}
            >
              The Attkisson Standard
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                fontWeight: 900,
                color: '#0a0a0b',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                marginBottom: '2.5rem'
              }}
            >
              Defined by <span style={{ color: '#ef4444' }}>Excellence.</span><br />
              Driven by Passion.
            </motion.h2>
          </div>
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '1.25rem',
                color: '#64748b',
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              At AttkissonAutos, we don't just sell cars. We curate masterpieces. Our legacy is built on the pursuit of automotive perfection and the satisfaction of the world's most discerning drivers.
            </motion.p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '4rem 3rem',
                background: '#f8fafc',
                borderRadius: '2.5rem',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              whileHover={{
                y: -15,
                boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
                borderColor: '#ef4444'
              }}
            >
              <div style={{
                width: 80,
                height: 80,
                background: '#fff',
                borderRadius: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                boxShadow: '0 10px 30px rgba(239,68,68,0.1)'
              }}>
                {block.icon}
              </div>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#0a0a0b',
                letterSpacing: '-0.02em'
              }}>
                {block.title}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                {block.description}
              </p>
              <motion.div
                whileHover={{ x: 10 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                Learn More <div style={{ width: 30, height: 2, background: '#ef4444' }} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandExperience;
