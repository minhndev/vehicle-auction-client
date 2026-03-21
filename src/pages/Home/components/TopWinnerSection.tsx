import React from 'react';
import styles from '../Home.module.css';

// Data Mock định nghĩa các Item cho Top Winner
interface Winner {
  id: string;
  name: string;
  image: string;
}

const MOCK_WINNERS: Winner[] = [
  {
    id: "0195608",
    name: "Albert Flores",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  },
  {
    id: "0195608",
    name: "Albert Flores",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  },
  {
    id: "0195608",
    name: "Albert Flores",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  },
  {
    id: "0195608",
    name: "Albert Flores",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80"
  }
];

// Sub-component thẻ Top Winner
const TopWinnerCard: React.FC<{ data: Winner }> = ({ data }) => {
  return (
    <div className={styles.topWinnerCard}>
      <div className={styles.topWinnerPill}>
        <img 
          src={data.image} 
          alt={data.name} 
          className={styles.topWinnerImage} 
        />
        
        <div className={styles.topWinnerInfo}>
          <h3 className={styles.topWinnerName}>
            {data.name}
          </h3>
          <p className={styles.topWinnerId}>
            ID: {data.id}
          </p>
        </div>
      </div>

      <button className={styles.topWinnerBagButton}>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=200&h=200&q=80" alt="Add" className={styles.topWinnerBagIcon} />
      </button>

    </div>
  );
};

// Component Chính
const TopWinnerSection: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.topWinnerSection}`}>
      <div className={styles.container}>
      <div className={styles.sectionColumnCenter}>
        
        {/* Header Title */}
        <div className={`${styles.titleBlock} ${styles.topWinnerTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.topWinnerTitle}`}>
            Top Winner
          </h2>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>
        </div>

        {/* Carousel Content */}
        <div className={styles.topWinnerCarousel}>
          <button className={`${styles.carouselArrowButton} ${styles.carouselArrowLeft}`}>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconBlack}>
              <path d="M6 1L1 6M1 6L6 11M1 6H25" />
            </svg>
          </button>

          <div className={styles.topWinnerCards}>
            {MOCK_WINNERS.map((winner, index) => (
              <TopWinnerCard key={index} data={winner} />
            ))}
          </div>

          <button className={`${styles.carouselArrowButton} ${styles.carouselArrowRight}`}>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconBlack}>
              <path d="M20 1L25 6M25 6L20 11M25 6H1" />
            </svg>
          </button>
          
        </div>

      </div>
      </div>
    </section>
  );
};

export default TopWinnerSection;

