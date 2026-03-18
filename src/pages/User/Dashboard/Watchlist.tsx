import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { watchlistApi } from '../../../api/watchlistApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import { AuctionCard } from '../../../features/bidding/components/AuctionCard/AuctionCard';
import type { Auction } from '../../../features/bidding/types';
import styles from './Watchlist.module.css';

export const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await watchlistApi.getWatchlist();
      // Handle page response or array
      if (response && response.content) {
        setItems(response.content);
      } else if (Array.isArray(response)) {
        setItems(response);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch your watchlist.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await watchlistApi.removeFromWatchlist(productId);
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      alert('Failed to remove item from watchlist');
    }
  };

  if (loading) {
    return <div className={styles.container}><div className="loadingSpinner">Loading watchlist...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Watchlist</h1>
      <p className={styles.subtitle}>Vehicles you are keeping an eye on.</p>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Your watchlist is empty</h3>
          <p>Save vehicles you're interested in to track their auction status easily.</p>
          <Button variant="primary" onClick={() => navigate('/auctions')}>Browse Vehicles</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((auction) => (
            <div key={auction.id} className={styles.watchlistItem}>
              <AuctionCard auction={auction} />
              <button 
                className={styles.removeBtn} 
                onClick={() => handleRemove(auction.id)}
                title="Remove from watchlist"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
