import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Package } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-bg-dark text-white pt-20 lg:pt-32 pb-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-16 mb-20 lg:mb-24">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase italic">
                ATTKISSON<span className="text-primary">AUTOS</span>
              </span>
            </Link>
            <p className="text-white/50 text-lg leading-relaxed max-w-md font-medium">
              The premier destination for quality used vehicles since 1996. We don't just sell cars; we deliver reliability and trust to our community.
            </p>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-10 text-primary">Showroom</h4>
            <ul className="space-y-6">
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Full Inventory</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">New Arrivals</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Family SUVs</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Daily Drivers</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} AttkissonAutos Dealership Group. All rights reserved.
          </p>
          <div className="flex gap-10 opacity-20 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
