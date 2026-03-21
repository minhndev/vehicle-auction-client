import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { bidApi, type BidResponse } from '../../../features/bidding/api/bidApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './MyBids.module.css';

const formatCurrency = (amount?: number) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const MyBids: React.FC = () => {
  const [bids, setBids] = useState<BidResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bidApi.getMyBids({ page: 0, size: 50 });
        const list = Array.isArray(data) ? data : (data as any)?.content || [];
        // Sort descending by created time
        const sorted = list.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBids(sorted);
      } catch (err: any) {
        // If API doesn't exist (e.g 404), fail gracefully.
        if (err?.response?.status === 404) {
          setBids([]);
        } else {
          setError(getErrorMessage(err, 'Lỗi kết nối khi tải lịch sử đấu giá.'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lịch Sử Trả Giá</h1>
      <p className={styles.subtitle}>Xem lại các mức giá bạn đã đặt cho các phương tiện trên hệ thống.</p>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableCard}>
        {loading ? (
          <div className="loadingSpinner" style={{ padding: '2rem' }}>Đang tải lịch sử trả giá...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Phương Tiện</th>
                <th>Mức Giá Đã Đặt</th>
                <th>Thời Gian</th>
                <th>Tình Trạng</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {bids.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    Bạn chưa tham gia trả giá phiền đấu nào hoặc hệ thống API chưa ghi nhận.
                    <br />
                    <Link to="/auctions" style={{ color: '#3b82f6', marginTop: '10px', display: 'inline-block', textDecoration: 'none' }}>Khám phá các phương tiện đang đấu giá →</Link>
                  </td>
                </tr>
              ) : (
                bids.map(bid => {
                  // Fallback names if backend does not inline product details in BidResponse
                  const vehicleName = bid.productName || (bid.vehicle ? `${bid.vehicle.brand} ${bid.vehicle.model}` : `ID Đấu Giá: #${bid.auctionId.substring(0,8)}`);
                  
                  return (
                    <tr key={bid.id}>
                      <td>
                        <strong>{vehicleName}</strong>
                        <div className={styles.infoText}>Mã Bid: #{bid.id.substring(0,8)}</div>
                      </td>
                      <td className={styles.amount}>{formatCurrency(bid.amount)}</td>
                      <td>{new Date(bid.createdAt).toLocaleString('vi-VN')}</td>
                      <td>
                        {/* We assume backend returns isWinning, if not, we can't definitively know unless we join auctions */}
                        {bid.isWinning === true ? (
                          <span className={styles.badgeWinning}>Đang Dẫn Đầu</span>
                        ) : bid.isWinning === false ? (
                          <span className={styles.badgeOutbid}>Bị Vượt Giá</span>
                        ) : (
                          <span className={styles.infoText}>Đã ghi nhận</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/auctions/${bid.auctionId}`} style={{ textDecoration: 'none' }}>
                          <Button variant="outline" size="small">Xem Phiên</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
