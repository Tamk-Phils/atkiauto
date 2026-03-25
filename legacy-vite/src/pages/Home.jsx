import React from 'react';
import Hero from '../components/Hero';
import LogoMarquee from '../components/LogoMarquee';
import FeaturedCars from '../components/FeaturedCars';
import BrandExperience from '../components/BrandExperience';
import PurchaseSteps from '../components/PurchaseSteps';
import DynamicStats from '../components/DynamicStats';
import Reviews from '../components/Reviews';
import NewsletterCTA from '../components/NewsletterCTA';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <LogoMarquee />
      <FeaturedCars />
      <BrandExperience />
      <PurchaseSteps />
      <DynamicStats />
      <Reviews />
      <NewsletterCTA />
      <Footer />
    </div>
  )
}

export default Home
