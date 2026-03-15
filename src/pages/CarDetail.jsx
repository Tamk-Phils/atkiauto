import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Gauge, Fuel, Settings, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react'

import { supabase } from '../lib/supabase'

const CarDetail = () => {
  const { id } = useParams()
  const [car, setCar] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [activeImage, setActiveImage] = React.useState(null)

  React.useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase
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
    fetchCar()
  }, [id])

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
    <div className="pt-32 pb-20 bg-bg-dark">
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
            <div className="glass-card overflow-hidden rounded-3xl mb-6 bg-slate-100">
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
              <p className="text-3xl lg:text-4xl font-black text-primary">${parseInt(car.price || 0).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 pb-10 border-b border-glass-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary">
                  <Fuel size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Fuel Type</p>
                  <p className="font-bold">{car.fuel}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary">
                  <Gauge size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Mileage</p>
                  <p className="font-bold">{car.mileage}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-tighter">Transmission</p>
                  <p className="font-bold">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary">
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
              <p className="text-text-muted leading-relaxed">
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
              <button className="btn btn-primary flex-1 py-4 lg:py-5 text-base lg:text-lg justify-center gap-3">
                Purchase Vehicle
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline px-8 py-4 lg:py-5 text-base lg:text-lg">
                Book Test Drive
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
