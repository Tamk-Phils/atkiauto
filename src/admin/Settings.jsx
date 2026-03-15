import React from 'react'
import { Bell, Globe, Lock, Shield, CreditCard, Palette } from 'lucide-react'

const Settings = () => {
  const sections = [
    { icon: <Globe />, title: 'Site Configuration', desc: 'Manage site metadata, domain, and SEO settings.' },
    { icon: <Lock />, title: 'Security & Access', desc: 'Control user permissions and administrator roles.' },
    { icon: <Palette />, title: 'Branding', desc: 'Update colors, logos, and global design tokens.' },
    { icon: <CreditCard />, title: 'Billing', desc: 'Manage your subscription and invoicing.' },
    { icon: <Bell />, title: 'Notifications', desc: 'Configure email and system alert preferences.' },
    { icon: <Shield />, title: 'Privacy & Terms', desc: 'Update your legal documentation and policies.' },
  ]

  return (
    <div className="animate-fade-in">
      <header className="mb-8 lg:mb-12">
        <h1 className="text-2xl lg:text-4xl font-black mb-2">Portal <span className="text-primary">Settings</span></h1>
        <p className="text-sm lg:text-base text-text-muted">Configure the AttkissonAutos platform to your needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, i) => (
          <div key={i} className="glass-card p-8 group cursor-pointer hover:border-primary transition-all">
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mb-6">
              {React.cloneElement(section.icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-bold mb-2">{section.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">{section.desc}</p>
            <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Manage Settings</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Settings
