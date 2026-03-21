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
  const [statusFilter, setStatusFilter] = useState<'all' | 'winning' | 'outbid'>('all');

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

  const filteredBids = bids.filter((bid) => {
    if (statusFilter === 'winning') return bid.isWinning === true;
    if (statusFilter === 'outbid') return bid.isWinning === false;
    return true;
  });

  const winningCount = bids.filter((bid) => bid.isWinning === true).length;
  const outbidCount = bids.filter((bid) => bid.isWinning === false).length;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Bidding History</p>
        <h1 className={styles.title}>Theo doi toan bo luot tra gia cua ban</h1>
        <p className={styles.subtitle}>Kiem tra vi tri dan dau, luot bi vuot gia va truy cap nhanh den phien dau gia dang quan tam.</p>

        <div className={styles.metrics}>
          <article className={styles.metricCard}>
            <span>Total bids</span>
            <strong>{bids.length}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>Winning bids</span>
            <strong>{winningCount}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>Outbid bids</span>
            <strong>{outbidCount}</strong>
          </article>
        </div>
      </section>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.filterRow}>
        <button
          type="button"
          className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`${styles.filterBtn} ${statusFilter === 'winning' ? styles.filterBtnActive : ''}`}
          onClick={() => setStatusFilter('winning')}
        >
          Winning
        </button>
        <button
          type="button"
          className={`${styles.filterBtn} ${statusFilter === 'outbid' ? styles.filterBtnActive : ''}`}
          onClick={() => setStatusFilter('outbid')}
        >
          Outbid
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Dang tai lich su tra gia...</div>
        ) : filteredBids.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>My Bids Empty State</h3>
            <p>
              Ban chua co du lieu phu hop voi bo loc hien tai. Hay tham gia mot phien dau gia de bat dau ghi nhan lich su bid.
            </p>
            <Link to="/auctions" className={styles.emptyAction}>
              Kham pha phien dang mo
            </Link>
          </div>
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
              {filteredBids.map((bid) => {
                const vehicleName = bid.productName || (bid.vehicle ? `${bid.vehicle.brand} ${bid.vehicle.model}` : `ID Dau Gia: #${bid.auctionId.substring(0, 8)}`);

                return (
                  <tr key={bid.id}>
                    <td>
                      <strong>{vehicleName}</strong>
                      <div className={styles.infoText}>Ma Bid: #{bid.id.substring(0, 8)}</div>
                    </td>
                    <td className={styles.amount}>{formatCurrency(bid.amount)}</td>
                    <td>{new Date(bid.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      {bid.isWinning === true ? (
                        <span className={styles.badgeWinning}>Dang dan dau</span>
                      ) : bid.isWinning === false ? (
                        <span className={styles.badgeOutbid}>Bi vuot gia</span>
                      ) : (
                        <span className={styles.infoText}>Da ghi nhan</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/auctions/${bid.auctionId}`} className={styles.tableActionLink}>
                        <Button variant="outline" size="small">Xem phien</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
