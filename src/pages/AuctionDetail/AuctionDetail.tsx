import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { Auction } from '../../features/bidding/types';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';
import { Button } from '../../components/ui/Button/Button';
import { store } from '../../store';
import styles from './AuctionDetail.module.css';

export const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');

  useEffect(() => {
    const fetchAuction = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await auctionApi.getAuctionById(id);
        // @ts-ignore
        setAuction(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching auction details');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  // Handle mock data for demo if API fails
  const renderAuction = auction || {
    id: id || 'demo-1',
    vehicle: {
      id: 'v-1',
      brand: 'Demo Brand',
      model: 'Demo Model',
      year: 2024,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      type: 'Sports',
      mileage: 1500,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
    },
    startingPrice: 50000,
    currentBid: 55000,
    totalBids: 12,
    endTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    // @ts-ignore
    status: auction?.status || 'active',
    sellerId: (auction as any)?.sellerId || 'seller-1'
  } as Auction;

  const { currentPrice: wsPrice, bidsCount: wsBids, isConnected, placeBid } = useAuctionWebSocket(renderAuction.id);

  const displayPrice = wsPrice !== null ? wsPrice : ((auction as any)?.currentPrice ?? renderAuction.currentBid);
  // @ts-ignore
  const displayBids = wsBids !== null ? wsBids : ((auction as any)?.totalBids ?? renderAuction.totalBids);

  const timeLeft = useCountdown(renderAuction.endTime);
  const isEnded = renderAuction.status === 'ended' || !timeLeft;

  const handlePlaceBid = () => {
    setBidError('');
    const amount = Number(bidAmount);
    if (!amount || isNaN(amount) || amount <= displayPrice) {
       setBidError('Trị giá thầu phải lớn hơn giá hiện tại');
       return;
    }
    const success = placeBid(amount);
    if (success) {
       setBidAmount('');
    } else {
       setBidError('Lỗi kết nối WebSocket!');
    }
  };

  if (loading && !auction) {
    return <div className={styles.loading}>Loading details...</div>;
  }

  if (error && !auction) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <Link to="/auctions">
          <Button variant="outline">Back to Auctions</Button>
        </Link>
      </div>
    );
  }

  // Support both mock structure and real DB structure
  // @ts-ignore
  const vehicle = auction?.vehicle || {
    // @ts-ignore
    brand: (auction as any)?.productName || renderAuction.vehicle.brand,
    model: renderAuction.vehicle.model,
    year: renderAuction.vehicle.year,
    image: renderAuction.vehicle.image,
    type: renderAuction.vehicle.type,
    mileage: renderAuction.vehicle.mileage,
    transmission: renderAuction.vehicle.transmission,
    fuelType: renderAuction.vehicle.fuelType
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isAuthenticated = !!store.getState().auth.accessToken;

  return (
    <div className={styles.container}>
      <Link to="/auctions" className={styles.backLink}>
        &larr; Back to Inventory
      </Link>

      <div className={styles.detailGrid}>
        {/* Left: Standard Image & Gallery */}
        <div className={styles.gallerySection}>
          <img 
            src={vehicle.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
            alt={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`} 
            className={styles.mainImage}
          />
          <div className={styles.thumbnailGrid}>
             <img src={vehicle.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} alt="Thumbnail" className={styles.thumbnail}/>
             <img src={vehicle.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} alt="Thumbnail" className={styles.thumbnail}/>
             <img src={vehicle.image || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} alt="Thumbnail" className={styles.thumbnail}/>
          </div>
          
          <div className={styles.vehicleSpecs}>
            <h3 className={styles.specsTitle}>Vehicle Specifications</h3>
            <ul className={styles.specsList}>
              <li><strong>VIN:</strong> {'1HGCM82633A004XXX'}</li>
              <li><strong>Type:</strong> {vehicle.type}</li>
              <li><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} mi</li>
              <li><strong>Transmission:</strong> {vehicle.transmission}</li>
              <li><strong>Fuel Type:</strong> {vehicle.fuelType}</li>
              <li><strong>Exterior Color:</strong> Black</li>
              <li><strong>Interior Color:</strong> Black Leather</li>
            </ul>
          </div>
        </div>

        {/* Right: Bidding Info */}
        <div className={styles.biddingSection}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{vehicle.year} {vehicle.brand} {vehicle.model}</h1>
            <p className={styles.subtitle}>Excellent condition, single owner, full service history.</p>
          </div>

          <div className={styles.bidBox}>
            <div className={styles.timerRow}>
              <span className={styles.timerLabel}>Time Left:</span>
              {isEnded ? (
                <span className={styles.endedText}>Auction Ended</span>
              ) : (
                <span className={styles.timerValue}>
                  {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              )}
            </div>
            
            <div className={styles.priceRow}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p className={styles.priceLabel}>Current Bid</p>
                  {isConnected && <span title="Live Updates Active" style={{ color: 'green', fontSize: '10px' }}>● LIVE</span>}
                </div>
                <p className={styles.currentPrice}>{formatCurrency(displayPrice)}</p>
              </div>
              <div>
                <p className={styles.bidsCount}>{displayBids} Bids</p>
              </div>
            </div>

            <div className={styles.actionRow}>
              {!isEnded && isAuthenticated ? (
                <div className={styles.bidForm}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="number" 
                      placeholder={`Min: ${formatCurrency(displayPrice + 100)}`}
                      className={styles.bidInput} 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                    <Button variant="primary" size="large" onClick={handlePlaceBid} style={{ flex: 1 }}>
                      Place Bid
                    </Button>
                  </div>
                  {bidError && <p style={{ color: 'red', fontSize: '12px', margin: 0 }}>{bidError}</p>}
                </div>
              ) : !isEnded && !isAuthenticated ? (
                <Link to="/login" style={{ textDecoration: 'none' }}>
                   <Button variant="outline" size="large" className={styles.fullWidthBtn}>
                     Login to Bid
                   </Button>
                </Link>
              ) : (
                <Button variant="outline" size="large" className={styles.fullWidthBtn} disabled>
                  Auction Closed
                </Button>
              )}
            </div>
            
            <p className={styles.bidContext}>
              Starting Price: {formatCurrency(renderAuction.startingPrice)}
            </p>
          </div>

          <div className={styles.sellerInfo}>
            <h3 className={styles.specsTitle}>Seller Information</h3>
            <div className={styles.sellerCard}>
              <div className={styles.sellerAvatar}>S</div>
              <div>
                <p className={styles.sellerName}>Verified Dealer LLC</p>
                <p className={styles.sellerRating}>★★★★☆ (120 reviews)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
