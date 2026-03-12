import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Auction } from '../../types';
import { useCountdown } from '../../../../hooks/useCountdown';
import { Button } from '../../../../components/ui/Button/Button';
import styles from './AuctionCard.module.css';

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const timeLeft = useCountdown(auction.endTime);
  const { vehicle } = auction;

  const handleBidClick = () => {
    navigate(`/auctions/${auction.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isEnded = auction.status === 'ended' || !timeLeft;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={`${styles.statusBadge} ${styles[auction.status]}`}>
          {auction.status}
        </span>
        <img 
          src={vehicle.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`} 
          className={styles.image}
          loading="lazy"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>
          {vehicle.year} {vehicle.brand} {vehicle.model}
        </h3>
        <div className={styles.meta}>
          <span>{vehicle.mileage.toLocaleString()} mi</span>
          <span>•</span>
          <span>{vehicle.transmission}</span>
        </div>

        <div className={styles.priceContainer}>
          <div>
            <div className={styles.priceLabel}>Current Bid</div>
            <div className={styles.price}>{formatCurrency(auction.currentBid)}</div>
          </div>
          <div className={styles.bidsCount}>
            {auction.totalBids} {auction.totalBids === 1 ? 'Bid' : 'Bids'}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {isEnded ? (
          <div className={`${styles.timer} ${styles.ended}`}>
            <span>Auction Ended</span>
          </div>
        ) : (
          <div className={styles.timer}>
            <span role="img" aria-label="time">⏳</span>
            <span>{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span>
          </div>
        )}
        <div style={{ flex: 1, marginLeft: 'var(--space-md)' }}>
          <Button 
            variant={isEnded ? 'secondary' : 'primary'} 
            size="small" 
            className={styles.bidBtn}
            onClick={handleBidClick}
            disabled={isEnded}
          >
            {isEnded ? 'View Details' : 'Bid Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};
