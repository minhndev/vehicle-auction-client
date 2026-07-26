import React from 'react';

import { HeroBannerText } from './components/HeroBannerText';
import { SearchFilterBar } from './components/SearchFilterBar';
import { ProductCategoryList } from './components/ProductCategoryList';
import { LiveAuction } from './components/LiveAuction';
import { AuctionCarsSection } from './components/AuctionCarsSection';
import CarFeatureSection from './components/CarFeatureSection';
import WhyChooseUsSection from './components/WhyChooseUsSection';
import HowItWorksSection from './components/HowItWorksSection';
import TopWinnerSection from './components/TopWinnerSection';
import TestimonialSection from './components/TestimonialSection';
import RegisterBanner from './components/RegisterBanner';

export const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden">

      {/* Tailwind Hero Section */}
      <section className="relative w-full min-h-[600px] flex justify-center items-center pt-24 pb-32 px-4 bg-gradient-to-br from-[#1e293b] to-[#2e3d83] overflow-visible">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1920&q=80')] mix-blend-overlay opacity-30 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <HeroBannerText />
        </div>

        {/* Floating Search Bar */}
        <div className="absolute left-0 right-0 -bottom-[45px] z-20 flex justify-center px-4">
          <SearchFilterBar />
        </div>
      </section>

      {/* Main Flow (Preserving Old Styles for the rest until converted) */}
      <div className="w-full flex flex-col items-center pt-24">
        <LiveAuction />
        <ProductCategoryList />

        <AuctionCarsSection />
        <CarFeatureSection />

        <WhyChooseUsSection />
        <HowItWorksSection />

        <TopWinnerSection />
        <TestimonialSection />

        <RegisterBanner />
      </div>
    </div>
  );
};

