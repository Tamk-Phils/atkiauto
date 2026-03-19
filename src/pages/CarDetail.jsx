import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Gauge, Fuel, Settings, ShieldCheck, Zap, Info, ArrowRight, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { notifyNewReservation } from '../lib/emailService'

const CarDetail = () => {
  const { id } = useParams()
  const [car, setCar] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [activeImage, setActiveImage] = React.useState(null)
  const [user, setUser] = React.useState(null)
  const [reserving, setReserving] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const fetchCar = async () => {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setCar(data)
        setActiveImage(data.images?.[0] || data.image_url)
      }
      setLoading(false)
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    fetchCar()
    checkUser()
  }, [id])

  const handleReserve = async () => {
    if (!user) {
      navigate('/auth', { state: { from: `/inventory/${id}` } })
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
        <Link to="/inventory" className="btn btn-primary">Back to Inventory</Link>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 bg-[#f8fafc] text-[#0a0a0b]">
      <div className="container">
        {/* Back Link */}
        <Link to="/inventory" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </Link>

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
                <span className="py-1 px-3 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30 uppercase tracking-widest">
                  {car.year} Model
                </span>
                <span className="text-text-muted text-sm uppercase tracking-widest">{car.type}</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black mb-2">{car.make} {car.model}</h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl lg:text-4xl font-black text-primary">${parseInt(car.price || 0).toLocaleString()}</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Reservation: <span className="text-primary">${parseInt(car.reservation_fee || 0).toLocaleString()}</span></p>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Down Payment: <span className="text-blue-600">${parseInt(car.down_payment || 0).toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 pb-10 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Fuel size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Fuel Type</p>
                  <p className="font-bold">{car.fuel}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Gauge size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Mileage</p>
                  <p className="font-bold">{car.mileage}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Transmission</p>
                  <p className="font-bold">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Year</p>
                  <p className="font-bold">{car.year}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary" />
                Description
              </h2>
              <p className="text-[#64748b] leading-relaxed">
                {car.description}
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {(car.features || ['Premium Audio', 'Navigation System', 'Leather Interior', 'Keyless Entry']).map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <ShieldCheck size={18} className="text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 lg:mt-auto flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleReserve}
                disabled={reserving || car.status === 'reserved' || car.status === 'sold'}
                className="btn btn-primary flex-1 py-4 lg:py-5 text-base lg:text-lg justify-center gap-3 disabled:opacity-50"
              >
                {reserving ? 'Reserving...' : car.status !== 'available' ? `Vehicle ${car.status}` : 'Reserve This Vehicle'}
                <ArrowRight size={20} />
              </button>
            </div>

            {showSuccess && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: '#111112',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '2.5rem',
                    borderRadius: '2rem',
                    maxWidth: '440px',
                    width: '100%',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                  }}
                >
                  <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-text-muted hover:text-white"><X size={20} /></button>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                    <Check size={32} />
                  </div>
                  <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Reservation Placed Successfully!</h2>
                  <p className="text-text-muted mb-8 leading-relaxed">
                    Your request for the <strong>{car.year} {car.make} {car.model}</strong> has been logged. 
                    Please contact our sales team via email or our live chat to proceed with the <strong>${car.reservation_fee}</strong> booking fee and finalize your reservation.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full py-4 text-sm uppercase tracking-widest font-black">
                      Go to Dashboard
                    </button>
                    <button onClick={() => setShowSuccess(false)} className="text-sm text-text-muted hover:text-white font-bold transition-colors">
                      Continue Browsing
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

export default CarDetail
