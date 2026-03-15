import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Gauge, Fuel, Settings, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react'

// Mock data (same as Inventory page for consistency)
const CARS = [
  { id: 1, make: 'Luminary', model: 'S-Edition', year: 2024, type: 'Electric Sedan', price: 89900, image: '/car_1.png', fuel: 'Electric', mileage: '250 mi', transmission: 'Auto', description: 'Experience the future of mobility with the Luminary S-Edition. Combining breathtaking performance with peerless luxury, this electric sedan redefines what a flagship vehicle can be.', features: ['Panoramic Roof', 'Massaging Seats', 'Autopilot 3.0', 'Bose Surround Sound'] },
  { id: 2, make: 'Titan', model: 'V8 Explorer', year: 2023, type: 'Luxury SUV', price: 115000, image: '/car_2.png', fuel: 'Petrol', mileage: '1,200 mi', transmission: 'Auto', description: 'The Titan V8 Explorer is the ultimate expression of luxury and capability. Whether navigating city streets or exploring the unknown, the Titan delivers power and poise in equal measure.', features: ['All-Wheel Drive', 'Air Suspension', 'Tow Package', 'Night Vision'] },
  { id: 3, make: 'Apex', model: 'RS Coupe', year: 2024, type: 'Sports Coupe', price: 145000, image: '/car_3.png', fuel: 'Petrol', mileage: '500 mi', transmission: 'Manual', description: 'Engineered for the driver who demands more. The Apex RS Coupe is a precision instrument designed to dominate both the track and the open road with its high-revving mill and perfect balance.', features: ['Carbon Ceramic Brakes', 'Titanium Exhaust', 'Launch Control', 'Race Seats'] },
  { id: 4, make: 'Elysium', model: 'Cabriolet', year: 2024, type: 'Luxury Convertible', price: 132000, image: '/car_4.png', fuel: 'Hybrid', mileage: '800 mi', transmission: 'Auto', description: 'Elegance without compromise. The Elysium Cabriolet offers a serene open-top driving experience, blending hybrid efficiency with the finest craftsmanship in the industry.', features: ['Nappa Leather', 'Heated Headrests', 'Soft Close Doors', 'Surround View Camera'] },
]

const CarDetail = () => {
  const { id } = useParams()
  const car = CARS.find(c => c.id === parseInt(id))

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
            <div className="glass-card overflow-hidden rounded-3xl mb-6">
              <img src={car.image} alt={car.name} className="w-full h-[500px] object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="glass-card h-24 overflow-hidden rounded-xl cursor-pointer hover:border-primary transition-all">
                  <img src={car.image} alt={`Gallery ${idx}`} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
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
              <h1 className="text-5xl font-black mb-2">{car.make} {car.model}</h1>
              <p className="text-4xl font-black text-primary">${car.price.toLocaleString()}</p>
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
              <div className="grid grid-cols-2 gap-y-4">
                {car.features.map(feature => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <ShieldCheck size={18} className="text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex gap-4">
              <button className="btn btn-primary flex-1 py-5 text-lg justify-center gap-3">
                Purchase Vehicle
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline px-8 py-5 text-lg">
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
