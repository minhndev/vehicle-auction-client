import React, { useState } from 'react';
import styles from '../Home.module.css';

// --- MOCK DATA ---
const MOCK_BODY_TYPES = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'sports', label: 'Sports' },
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'convertible', label: 'Convertible' },
  { id: 'suv', label: 'SUV' },
  { id: 'muv', label: 'MUV' },
  { id: 'luxury', label: 'Luxury' },
];

interface AuctionCar {
  id: string;
  name: string;
  image: string;
  currentBid: string;
  timeLeft: string;
  isTrending?: boolean;
}

const MOCK_CARS: AuctionCar[] = [
  {
    id: '1',
    name: 'Tata Tigor Xz',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    timeLeft: '10 : 20 : 47',
    isTrending: true,
  },
  {
    id: '2',
    name: 'Honda City',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    timeLeft: '10 : 20 : 47',
    isTrending: true,
  },
  {
    id: '3',
    name: 'Honda City',
    image: 'https://images.unsplash.com/photo-1617814076367-ee1980816bf3?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    timeLeft: '10 : 20 : 47',
    isTrending: true,
  },
  {
    id: '4',
    name: 'Honda City',
    image: 'https://images.unsplash.com/photo-1549317661-bc41c8291eb0?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    timeLeft: '10 : 20 : 47',
    isTrending: false,
  },
];

// --- SUB COMPONENTS ---
const AuctionCarCard: React.FC<AuctionCar> = ({ name, image, currentBid, timeLeft, isTrending }) => {
  return (
    <div className={styles.auctionCard}>
      <div className={styles.auctionCardTopCircle}>
        <div className={styles.auctionCardTopDot}></div>
      </div>

      {isTrending && (
        <div className={styles.auctionCardTrending}>
          Trending
        </div>
      )}

      <h3 className={styles.auctionCardTitle}>{name}</h3>

      <div className={styles.auctionCardSeparator}></div>

      <div className={styles.auctionCardImageWrap}>
        <img src={image} alt={name} className={styles.auctionCardImage} />
      </div>

      <div className={styles.auctionCardMetaRow}>
        <div className={styles.auctionCardMetaCol}>
          <span className={styles.auctionCardMetaLabel}>Current Bid</span>
          <span className={styles.auctionCardMetaValue}>{currentBid}</span>
        </div>
        <div className={styles.auctionCardMetaCol}>
          <span className={styles.auctionCardMetaLabel}>Waiting for Bid</span>
          <span className={styles.auctionCardMetaValue}>{timeLeft}</span>
        </div>
      </div>

      <button className={styles.auctionCardButton}>
        Submit A Bid
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const AuctionCarsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sedan');

  return (
    <section className={`${styles.section} ${styles.sectionPrimary} ${styles.auctionBodySection}`}>
      <div className={styles.containerWide}>
      
      <div className={`${styles.titleBlock} ${styles.auctionBodyTitleBlock}`}>
      <h2 className={`${styles.title} ${styles.titleOnDark} ${styles.auctionBodyTitle}`}>Cars Auction by Bodytype</h2>

      <div className={styles.divider}>
        <div className={`${styles.dividerLine} ${styles.dividerWhiteLine}`}></div>
        <div className={`${styles.dividerDot} ${styles.dividerDiamond}`}></div>
      </div>
      </div>

      <div className={styles.auctionTabs}>
        <div className={styles.auctionTabsLine}></div>
        
        <div className={styles.auctionTabsRow}>
          {MOCK_BODY_TYPES.map((type) => {
            const isActive = activeTab === type.id;
            return (
              <div 
                key={type.id} 
                className={`${styles.auctionTab} ${isActive ? styles.auctionTabActive : ''}`}
                onClick={() => setActiveTab(type.id)}
              >
                <span>{type.label}</span>
                {isActive && (
                  <div className={styles.auctionTabActiveLine}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.auctionCardsGrid}>
        {MOCK_CARS.map(car => (
          <AuctionCarCard key={car.id} {...car} />
        ))}
      </div>
      
      </div>
    </section>
  );
};

