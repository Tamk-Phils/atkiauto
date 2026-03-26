"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Gauge, Fuel, Settings, ShieldCheck, Zap, Info, ArrowRight, Check, X } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { notifyNewReservation } from '@/lib/emailService'

const CarDetailClient = ({ initialCar }) => {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  
  const [car, setCar] = useState(initialCar)
  const [loading, setLoading] = useState(!initialCar)
  const [activeImage, setActiveImage] = useState(initialCar?.images?.[0] || initialCar?.image_url)
  const [user, setUser] = useState(null)
  const [reserving, setReserving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()
  }, [])

  const handleReserve = async () => {
    if (!user) {
      router.push(`/auth?from=/inventory/${id}`)
      return
    }

    setReserving(true)
    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          user_id: user.id,
          car_id: id,
          fee: car.reservation_fee || 0,
          status: 'pending',
          payment_status: 'unpaid'
        }])
      
      if (error) throw error
      
      // Email Notification
      notifyNewReservation({
        full_name: user.user_metadata?.full_name || user.email,
        email: user.email,
        phone: user.user_metadata?.phone || 'N/A',
        car_name: `${car.year} ${car.make} ${car.model}`,
        reservation_date: new Date().toLocaleDateString()
      }).catch(err => console.error('Email notify failed:', err))

      setShowSuccess(true)
    } catch (error) {
      alert(`Reservation failed: ${error.message}`)
    } finally {
      setReserving(false)
    }
  }

  if (loading) return <div className="pt-40 text-center container"><p>Loading details...</p></div>

  if (!car) {
    return (
      <div className="pt-40 text-center container">
        <h2 className="text-4xl font-bold mb-4">Car Not Found</h2>
        <Link href="/inventory" className="btn btn-primary">Back to Inventory</Link>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 bg-[#f8fafc] text-[#0a0a0b]">
      <div className="container">
        {/* Back Link */}
        <Link href="/inventory" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group no-underline">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </Link>

        {/* JSON-LD for Vehicle */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            "name": `${car.year} ${car.make} ${car.model}`,
            "image": activeImage,
            "description": car.description,
            "brand": { "@type": "Brand", "name": car.make },
            "modelDate": car.year,
            "vehicleConfiguration": car.type,
            "mileageFromOdometer": { "@type": "QuantitativeValue", "value": car.mileage, "unitCode": "SMI" },
            "fuelType": car.fuel,
            "vehicleTransmission": car.transmission,
            "offers": {
              "@type": "Offer",
              "price": car.price,
              "priceCurrency": "USD",
              "availability": car.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          }) }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Media */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="overflow-hidden rounded-3xl mb-6 bg-white border border-[#e2e8f0] shadow-sm">
              <img src={activeImage} alt={car.make} className="w-full h-[300px] lg:h-[500px] object-cover" />
            </div>
            {car.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {car.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square overflow-hidden rounded-xl cursor-pointer border-2 transition-all ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="py-1 px-3 bg-red-100 text-primary text-xs font-bold rounded-full border border-red-200 uppercase tracking-widest">
                  {car.year} Model
                </span>
                <span className="text-slate-500 text-sm uppercase tracking-widest">{car.type}</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black mb-2">{car.make} {car.model}</h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl lg:text-4xl font-black text-primary">${parseInt(car.price || 0).toLocaleString()}</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reservation: <span className="text-primary">${parseInt(car.reservation_fee || 0).toLocaleString()}</span></p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Down Payment: <span className="text-blue-600">${parseInt(car.down_payment || 0).toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 pb-10 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Fuel size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Fuel Type</p>
                  <p className="font-black text-sm">{car.fuel}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Gauge size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Mileage</p>
                  <p className="font-black text-sm">{car.mileage}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Transmission</p>
                  <p className="font-black text-sm">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Year</p>
                  <p className="font-black text-sm">{car.year}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-base font-black mb-4 flex items-center gap-2 text-slate-900 uppercase tracking-tight italic">
                <Info size={18} className="text-primary" />
                Description
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                {car.description || "No description provided for this vehicle. Please contact our sales team for full specifications and history."}
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-base font-black mb-6 flex items-center gap-2 text-slate-900 uppercase tracking-tight italic">
                <Zap size={18} className="text-primary" />
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {(car.features && car.features.length > 0 
                  ? car.features 
                  : ['Premium Audio System', 'Modern Safety Package', 'Luxury Interior', 'Performance Wheels']
                ).map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                    <ShieldCheck size={16} className="text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 lg:mt-auto flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleReserve}
                disabled={reserving || car.status === 'reserved' || car.status === 'sold'}
                className="bg-primary hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 lg:py-5 flex-1 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-xs shadow-xl shadow-red-500/20"
              >
                {reserving ? 'Reserving...' : car.status !== 'available' ? `Vehicle ${car.status}` : 'Reserve This Vehicle'}
                <ArrowRight size={18} />
              </button>
            </div>

            {showSuccess && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: '#ffffff',
                    padding: '3rem 2.5rem',
                    borderRadius: '2.5rem',
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 32px 64px -12px rgba(0,0,0,0.15)',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <button onClick={() => setShowSuccess(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
                  
                  {/* Status Icon */}
                  <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 ring-8 ring-primary/10">
                      <Check size={40} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Header */}
                  <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter text-slate-900">Reservation Initiated</h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto font-medium">
                    Your request for the <span className="text-slate-900 font-bold">{car.year} {car.make} {car.model}</span> has been logged.
                  </p>
                  
                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 text-left shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Booking Summary</p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Fee</span>
                        <span className="text-base font-black text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 tracking-tight">
                          ${parseInt(car.reservation_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200 w-full opacity-50" />
                      <div className="flex justify-between items-center group">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Down Payment</span>
                        <span className="text-base font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 tracking-tight">
                          ${parseInt(car.down_payment || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 mb-8 leading-relaxed italic uppercase tracking-widest bg-slate-100 py-3 rounded-xl">
                    Contact our team via live chat or email to finalize payment
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => router.push('/dashboard')} 
                      className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl text-[11px] uppercase tracking-[0.25em] font-black shadow-xl shadow-primary/25 transition-all active:scale-[0.98]"
                    >
                      Management Dashboard
                    </button>
                    <button 
                      onClick={() => setShowSuccess(false)} 
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-3"
                    >
                      Dismiss & Continue Browsing
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CarDetailClient
