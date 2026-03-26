import { supabase } from '@/lib/supabase'
import CarDetailClient from './CarDetailClient'

export async function generateMetadata({ params }) {
  const id = params.id
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) {
    return {
      title: 'Vehicle Not Found',
    }
  }

  return {
    title: `${car.year} ${car.make} ${car.model} | For Sale`,
    description: `Buy this ${car.year} ${car.make} ${car.model} at Attkisson Autos. ${car.mileage} miles, ${car.fuel} fuel, ${car.transmission} transmission. Professional heritage and reliability since 1996.`,
    openGraph: {
      title: `${car.year} ${car.make} ${car.model} - Attkisson Autos`,
      description: `Premium ${car.make} ${car.model} available now.`,
      images: [car.images?.[0] || car.image_url],
    },
  }
}

export default async function Page({ params }) {
  const id = params.id
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  return <CarDetailClient initialCar={car} />
}
