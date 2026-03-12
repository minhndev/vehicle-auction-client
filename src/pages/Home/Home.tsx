import React from 'react';
import type { Auction } from '../../features/bidding/types';
import { AuctionCard } from '../../features/bidding/components/AuctionCard/AuctionCard';
import { Button } from '../../components/ui/Button/Button';
import styles from './Home.module.css';

// Mock Data for UI rendering
const generateMockAuctions = (): Auction[] => {
  const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Tesla', 'Ford', 'Audi', 'Lexus'];
  const types = ['SUV', 'Sedan', 'Luxury', 'Electric', 'Truck'];
  
  return Array.from({ length: 8 }).map((_, i) => {
    const end = new Date();
    end.setHours(end.getHours() + Math.floor(Math.random() * 72) + 2); // Random end time 2-74 hours from now

    return {
      id: `auction-${i}`,
      vehicle: {
        id: `veh-${i}`,
        brand: brands[i % brands.length],
        model: `Model ${String.fromCharCode(88 + (i % 3))}`,
        year: 2018 + (i % 5),
        type: types[i % types.length],
        image: `https://images.unsplash.com/photo-${1502877338535 + i * 10}-fe868200d072?auto=format&fit=crop&q=80&w=800&h=600`, // Using dummy placeholder variations
        mileage: 12000 + (i * 8000),
        fuelType: i % 4 === 0 ? 'Electric' : 'Gasoline',
        transmission: i % 2 === 0 ? 'Automatic' : 'Manual',
      },
      startingPrice: 15000 + (i * 2000),
      currentBid: 18000 + (Math.floor(Math.random() * 10) * 1000),
      totalBids: Math.floor(Math.random() * 45) + 5,
      endTime: end.toISOString(),
      status: 'active',
      sellerId: 'seller-1',
    };
  });
};

export const Home: React.FC = () => {
  const featuredAuctions = generateMockAuctions();

  return (
    <div className={styles.pageContainer}>
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Find and Bid on Your Dream Car.</h1>
          <p className={styles.heroSubtitle}>
            The most trusted platform for online vehicle auctions. Connect with verified sellers and bid with absolute confidence.
          </p>
        </div>
      </section>

      {/* Advanced Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Brand</label>
          <select className={styles.filterInput}>
            <option value="">Any Brand</option>
            <option value="toyota">Toyota</option>
            <option value="bmw">BMW</option>
            <option value="tesla">Tesla</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Vehicle Type</label>
          <select className={styles.filterInput}>
            <option value="">Any Type</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="truck">Truck</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Price Range</label>
          <select className={styles.filterInput}>
            <option value="">Any Price</option>
            <option value="under20k">Under $20,000</option>
            <option value="20k-50k">$20k - $50k</option>
            <option value="above50k">Above $50,000</option>
          </select>
        </div>
        <div>
          <Button variant="primary" style={{ width: '100%', height: '42px' }}>Search Inventory</Button>
        </div>
      </div>

      {/* Featured Live Auctions */}
      <section className={styles.section} style={{ paddingTop: '0' }}>
        <h2 className={styles.sectionTitle}>Featured Live Auctions</h2>
        <div className={styles.auctionsGrid}>
          {featuredAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <Button variant="outline" size="large">View All Auctions</Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.section} style={{ backgroundColor: '#f8fafc' }}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        <div className={styles.categoriesGrid}>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🚙</div>
            <div className={styles.categoryName}>SUVs</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>⚡</div>
            <div className={styles.categoryName}>Electric</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🛻</div>
            <div className={styles.categoryName}>Trucks</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>💎</div>
            <div className={styles.categoryName}>Luxury</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsContainer}>
          <div>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Register to Bid</h3>
            <p className={styles.stepDesc}>Create a free account and get instantly verified to participate in live auctions.</p>
          </div>
          <div>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Find Your Car</h3>
            <p className={styles.stepDesc}>Browse hundreds of inspected and verified vehicles from trusted sellers.</p>
          </div>
          <div>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Place Your Bid</h3>
            <p className={styles.stepDesc}>Join the live auction, place your highest bid, and win your dream vehicle.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
