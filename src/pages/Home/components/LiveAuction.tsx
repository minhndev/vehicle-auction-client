import React from 'react';
import styles from '../Home.module.css';

// --- MOCK DATA ---
interface LiveAuctionItem {
  id: string;
  name: string;
  image: string;
  currentBid: string;
  buyNow: string;
  timeLeft: { hours: number; minutes: number; seconds: number };
}

const LIVE_AUCTION_MOCK_DATA: LiveAuctionItem[] = [
  {
    id: '1',
    name: 'Tata Tigor Xz',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    buyNow: '$1,199.99',
    timeLeft: { hours: 10, minutes: 20, seconds: 47 }
  },
  {
    id: '2',
    name: 'Honda Elevate',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    buyNow: '$1,199.99',
    timeLeft: { hours: 10, minutes: 20, seconds: 47 }
  },
  {
    id: '3',
    name: 'Mahindra Scorpio-N',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    buyNow: '$1,199.99',
    timeLeft: { hours: 10, minutes: 20, seconds: 47 }
  },
  {
    id: '4',
    name: 'Nissan City',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    currentBid: '$1,079.99',
    buyNow: '$1,199.99',
    timeLeft: { hours: 10, minutes: 20, seconds: 47 }
  }
];

// --- SUB-COMPONENTS ---
const LiveAuctionCard: React.FC<{ data: LiveAuctionItem }> = ({ data }) => {
  return (
    <div className={styles.liveCard}>
      <div className={styles.liveBadge}>LIVE</div>
      <div className={styles.liveImageWrap}>
        <img src={data.image} alt={data.name} className={styles.liveImage} />
      </div>

      <div className={styles.liveContent}>
        <h3 className={styles.liveCarName}>{data.name}</h3>

        <div className={styles.livePriceRow}>
          <div className={styles.livePriceCol}>
            <span className={styles.livePriceLabel}>Bids</span>
            <span className={styles.livePriceValue}>{data.currentBid}</span>
          </div>
          <div className={styles.livePriceDivider}></div>
          <div className={styles.livePriceCol}>
            <span className={styles.livePriceLabel}>Buy Now</span>
            <span className={styles.livePriceValue}>{data.buyNow}</span>
          </div>
        </div>

        <div className={styles.liveTimeRow}>
          <span className={styles.liveTimeTag}>Time Left</span>
          <span className={styles.liveTimeValue}>{data.timeLeft.hours}H : {data.timeLeft.minutes}M : {data.timeLeft.seconds}S</span>
        </div>

        <button className={styles.liveBidButton}>
          Submit A Bid
        </button>
      </div>
    </div>
  );
};

export const LiveAuction: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionPrimary} ${styles.liveSection}`}>
      <div className={styles.container}>
      <div className={`${styles.titleBlock} ${styles.liveTitleBlock}`}>
        <h2 className={`${styles.title} ${styles.titleOnDark} ${styles.liveTitle}`}>
          Live Auction
        </h2>
        <div className={styles.divider}>
            <div className={`${styles.dividerLine} ${styles.liveTitleDividerLine}`}></div>
            <div className={styles.dividerDot}></div>
        </div>
      </div>

      <div className={styles.liveTabsWrap}>
        <div className={styles.liveTabsRow}>
            <button className={styles.liveTabActive}>Live Auction</button>
            <button className={styles.liveTabIdle}>Upcoming Auction</button>
        </div>
      </div>

      <div className={styles.liveCardGrid}>
        {LIVE_AUCTION_MOCK_DATA.map((item) => (
          <LiveAuctionCard key={item.id} data={item} />
        ))}
      </div>

      </div>
    </section>
  );
};

export default LiveAuction;

