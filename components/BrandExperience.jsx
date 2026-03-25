"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Cpu } from 'lucide-react';

const blocks = [
  {
    icon: <Shield size={48} />,
    title: 'Certified Quality',
    description: "Every vehicle undergoes a rigorous 150-point inspection by our certified technicians to ensure it meets our high standards for safety and reliability.",
    accent: '#ef4444'
  },
  {
    icon: <Zap size={48} />,
    title: 'Unbeatable Value',
    description: "We price our hand-picked inventory to sell. Get more car for your money with our transparent pricing and competitive financing options.",
    accent: '#ef4444'
  },
  {
    icon: <Target size={48} />,
    title: 'Customer Trust',
    description: "With nearly 30 years in the community, our reputation is built on honesty. No hidden fees, no pressure—just straightforward car buying.",
    accent: '#ef4444'
  }
];

const BrandExperience = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-24 lg:py-40 bg-white relative z-[1]">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-32 mb-16 lg:mb-32 items-center text-center lg:text-left">
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
              Defined by <span style={{ color: '#ef4444' }}>Trust.</span><br />
              Driven by Reliability.
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
              At AttkissonAutos, we don't just sell cars. We provide peace of mind. Our legacy is built on the longevity of our vehicles and the absolute trust of our community.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: isMobile ? '3rem 2rem' : '4rem 3rem',
                background: '#f8fafc',
                borderRadius: '2.5rem',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : 'flex-start',
                textAlign: isMobile ? 'center' : 'left',
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
                  justifyContent: isMobile ? 'center' : 'flex-start',
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
                Learn More { !isMobile && <div style={{ width: 30, height: 2, background: '#ef4444' }} /> }
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandExperience;
