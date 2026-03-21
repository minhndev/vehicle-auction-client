import React from 'react';
import styles from '../Home.module.css';

export const HeroBannerText: React.FC = () => {
  return (
    <div className={styles.heroTextWrap}>
      <div className={styles.heroBadge}>WELCOME TO AUCTION</div>

      <h1 className={styles.heroTitle}>Find Your Dream Car</h1>

      <p className={styles.heroDescription}>
        {"Discover exclusive deals on premium vehicles. Start bidding today and get behind the wheel of your dream car at unbeatable prices."}
      </p>
    </div>
  );
};

