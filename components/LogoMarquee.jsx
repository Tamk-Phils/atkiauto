"use client"
import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  'AETHER PERFORMANCE', 'LUXE DYNAMICS', 'VERTEX RACING', 'ZENITH PARTS',
  'APEX FORGED', 'VELOCITY OILS', 'TITAN CARBON', 'ORBITAL WHEELS'
];

const LogoMarquee = () => {
  return (
    <section style={{
      background: '#fff',
      padding: '4rem 0',
      borderBottom: '1px solid #f1f5f9',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100px',
        height: '100%',
        background: 'linear-gradient(90deg, #fff, transparent)',
        zIndex: 2
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100%',
        background: 'linear-gradient(-90deg, #fff, transparent)',
        zIndex: 2
      }} />

      <div style={{ display: 'flex', width: '200%' }}>
        <motion.div
          animate={{ x: [0, '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: '5rem', alignItems: 'center', minWidth: '100%' }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <span key={i} style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#cbd5e1',
              letterSpacing: '0.4em',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LogoMarquee;
