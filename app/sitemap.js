import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // revalidate at most every hour

export default async function sitemap() {
  const baseUrl = 'https://attkissonautos.com'

  // Fetch all cars to generate dynamic routes
  const { data: cars } = await supabase.from('cars').select('id, updated_at')

  const carUrls = cars?.map((car) => ({
    url: `${baseUrl}/inventory/${car.id}`,
    lastModified: car.updated_at || new Date(),
  })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/finance`,
      lastModified: new Date(),
    },
    ...carUrls,
  ]
}
