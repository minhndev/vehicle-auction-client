import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { watchlistApi } from '../../../api/watchlistApi';
import type { WatchlistModel } from '../../../types/index';
import styles from './Watchlist.module.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

export const Watchlist: React.FC = () => {
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
      setError('Không thể tải danh sách quan tâm. Vui lòng thử lại.');
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
      alert('Không thể xoá khỏi danh sách quan tâm');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Danh sách quan tâm</h1>
      <p className={styles.subtitle}>Các xe bạn đang theo dõi.</p>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Danh sách trống</h3>
          <p>Lưu các xe bạn quan tâm để theo dõi trạng thái đấu giá dễ dàng hơn.</p>
          <Button variant="primary" onClick={() => navigate('/auctions')}>
            Xem đấu giá
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.watchlistItem}>
              <div style={{ position: 'relative' }}>
                <img
                  src={FALLBACK_IMAGE}
                  alt="Xe"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              <div style={{ padding: '12px 0 8px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  ID sản phẩm: <strong>{item.productId?.substring(0, 8)}…</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Theo dõi từ: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => item.productId && navigate(`/auctions?productId=${item.productId}`)}
                >
                  Xem đấu giá
                </Button>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(item.productId)}
                >
                  ✕ Bỏ theo dõi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
