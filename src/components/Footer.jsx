import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Package } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-bg-dark text-white pt-20 lg:pt-32 pb-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 mb-20 lg:mb-24">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Package className="text-white" size={24} />
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase italic">
                ATTKISSON<span className="text-primary">AUTOS</span>
              </span>
            </Link>
            <p className="text-white/50 text-lg leading-relaxed max-w-md font-medium">
              The premier destination for luxury automotive excellence since 2000. We don't just sell cars; we deliver legacies.
            </p>
            <div className="flex gap-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
                  <Icon size={22} className="text-white/60 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-10 text-primary">Showroom</h4>
            <ul className="space-y-6">
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Full Inventory</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">New Arrivals</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Classic Series</Link></li>
              <li><Link to="/inventory" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Track Ready</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-10 text-primary">Services</h4>
            <ul className="space-y-6">
              <li><Link to="/finance" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Elite Finance</Link></li>
              <li><Link to="/service" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Master Service</Link></li>
              <li><Link to="/service" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Parts Boutique</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Concierge</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-10 text-primary">Headquarters</h4>
            <ul className="space-y-6 text-white/60">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-primary shrink-0" />
                <span className="text-sm font-bold uppercase tracking-widest leading-relaxed">Luxury Drive 101, Beverly Hills, CA 90210</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={20} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">+1 (800) ATT-AUTO</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={20} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">concierge@attkisson.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} AttkissonAutos Global Group. All rights reserved.
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
