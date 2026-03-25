"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-white relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0b] p-10 lg:p-24 rounded-[2.5rem] lg:rounded-[4rem] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center text-center lg:text-left relative overflow-hidden shadow-2xl shadow-black/20"
        >
          {/* Decorative Red Glow */}
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div>
            <span className="block text-primary font-black uppercase tracking-[0.4em] text-[10px] lg:text-xs mb-4">
              Limited Access
            </span>
            <h2 className="text-3xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
              Join the <span className="text-primary">Inner Circle.</span>
            </h2>
            <p className="text-slate-400 text-lg lg:text-xl leading-relaxed max-w-[500px] lg:mx-0 mx-auto">
              Get exclusive early access to our rarest inventory and new inventory launches before they reach the public market.
            </p>
          </div>

          <div className="w-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-white text-lg font-medium outline-none transition-all focus:border-primary focus:bg-white/10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-red-600 transition-all text-white px-6 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95"
                >
                  <Send size={24} />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '2rem',
                  padding: '3rem',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  background: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  margin: '0 auto 2rem'
                }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Welcome to the Inner Circle</h3>
                <p style={{ color: '#94a3b8' }}>A specialized consultant will brief you shortly.</p>
              </motion.div>
            )}
            <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
              We respect your privacy. Opt-out at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
