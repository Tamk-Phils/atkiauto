import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section style={{
      padding: '8rem 0',
      background: '#fff',
      position: 'relative'
    }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            background: '#0a0a0b',
            padding: '6rem 4rem',
            borderRadius: '4rem',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '6rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
          }}
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
            <span style={{
              display: 'block',
              color: '#ef4444',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              fontSize: '0.9rem',
              marginBottom: '1.5rem'
            }}>
              Limited Access
            </span>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 4vw, 4rem)',
              fontWeight: 950,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: '2rem'
            }}>
              Join the <span style={{ color: '#ef4444' }}>Inner Circle.</span>
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '500px'
            }}>
              Get exclusive early access to our rarest inventory and bespoke collection launches before they reach the public market.
            </p>
          </div>

          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem 6.5rem 1.5rem 2.5rem',
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    bottom: '10px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '1.25rem',
                    width: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
