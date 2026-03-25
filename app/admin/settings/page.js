"use client"
import React from 'react'
import { Bell, Globe, Lock, Shield, CreditCard, Palette } from 'lucide-react'

const SettingsPage = () => {
  const sections = [
    { icon: <Globe />, title: 'Site Configuration', desc: 'Manage site metadata, domain, and SEO settings.' },
    { icon: <Lock />, title: 'Security & Access', desc: 'Control user permissions and administrator roles.' },
    { icon: <Palette />, title: 'Branding', desc: 'Update colors, logos, and global design tokens.' },
    { icon: <CreditCard />, title: 'Billing', desc: 'Manage your subscription and invoicing.' },
    { icon: <Bell />, title: 'Notifications', desc: 'Configure email and system alert preferences.' },
    { icon: <Shield />, title: 'Privacy & Terms', desc: 'Update your legal documentation and policies.' },
  ]

  return (
    <div className="animate-fade-in text-left">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 uppercase italic text-slate-900">Portal <span className="text-primary">Settings</span></h1>
        <p className="text-slate-500 font-medium">Configure the AttkissonAutos platform to your needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sections.map((section, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 group cursor-pointer hover:border-primary transition-all shadow-sm">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mb-6">
              {React.cloneElement(section.icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">{section.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 italic">{section.desc}</p>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Manage Settings</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingsPage
