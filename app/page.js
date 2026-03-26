import React from 'react';
import Hero from '@/components/Hero';
import LogoMarquee from '@/components/LogoMarquee';
import FeaturedCars from '@/components/FeaturedCars';
import BrandExperience from '@/components/BrandExperience';
import PurchaseSteps from '@/components/PurchaseSteps';
import DynamicStats from '@/components/DynamicStats';
import Reviews from '@/components/Reviews';
import NewsletterCTA from '@/components/NewsletterCTA';

export const metadata = {
  title: "Quality Used Cars for Sale | Attkisson Autos",
  description: "Browse the best selection of certified pre-owned vehicles at Attkisson Autos. Easy financing, premium heritage, and nationwide trust since 1996.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CarDealer",
    "name": "Attkisson Autos",
    "image": "https://attkissonautos.com/logo.png",
    "@id": "https://attkissonautos.com",
    "url": "https://attkissonautos.com",
    "telephone": "+1-555-0199",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Heritage Drive",
      "addressLocality": "Premium City",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "16:00"
      }
    ],
    "sameAs": [
      "https://facebook.com/attkissonautos",
      "https://instagram.com/attkissonautos"
    ]
  };

  return (
    <div className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <LogoMarquee />
      <FeaturedCars />
      <BrandExperience />
      <PurchaseSteps />
      <DynamicStats />
      <Reviews />
      <NewsletterCTA />
    </div>
  );
}
