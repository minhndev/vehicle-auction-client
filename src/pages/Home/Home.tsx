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
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <div className={styles.page}>

      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <HeroBannerText />
        </div>

        <div className={styles.heroSearch}>
          <SearchFilterBar />
        </div>
      </section>

      <div className={styles.mainFlow}>
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

