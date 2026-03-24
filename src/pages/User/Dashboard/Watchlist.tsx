import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { watchlistApi } from '../../../api/watchlistApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { WatchlistModel } from '../../../types/index';
import styles from './Watchlist.module.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

export const Watchlist: React.FC = () => {
  const { tp } = usePageI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchlistModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await watchlistApi.getWatchlist();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError(tp('watchlist.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId?: string) => {
    if (!productId) return;
    try {
      await watchlistApi.removeFromWatchlist(productId);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch {
      alert(tp('watchlist.removeError'));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>{tp('watchlist.loading')}</div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('watchlist.title')}</h1>
      <p className={styles.subtitle}>{tp('watchlist.subtitle')}</p>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>{tp('watchlist.emptyTitle')}</h3>
          <p>{tp('watchlist.emptySubtitle')}</p>
          <Button variant="primary" onClick={() => navigate('/auctions')}>
            {tp('watchlist.viewAuctions')}
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.watchlistItem}>
              <div style={{ position: 'relative' }}>
                <img
                  src={FALLBACK_IMAGE}
                  alt={tp('watchlist.vehicleAlt')}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              <div style={{ padding: '12px 0 8px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  {tp('watchlist.productId')}: <strong>{item.productId?.substring(0, 8)}…</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {tp('watchlist.followedFrom')}: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : tp('watchlist.notAvailable')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => item.productId && navigate(`/auctions?productId=${item.productId}`)}
                >
                  {tp('watchlist.viewAuctions')}
                </Button>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(item.productId)}
                >
                  ✕ {tp('watchlist.unfollow')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
