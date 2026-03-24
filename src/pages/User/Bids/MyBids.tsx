import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { bidApi, type BidResponse } from '../../../features/bidding/api/bidApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
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
  const { tp } = usePageI18n();
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
          setError(getErrorMessage(err, tp('myBids.loadError')));
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
        <p className={styles.eyebrow}>{tp('myBids.eyebrow')}</p>
        <h1 className={styles.title}>{tp('myBids.title')}</h1>
        <p className={styles.subtitle}>{tp('myBids.subtitle')}</p>

        <div className={styles.metrics}>
          <article className={styles.metricCard}>
            <span>{tp('myBids.totalBids')}</span>
            <strong>{bids.length}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>{tp('myBids.winningBids')}</span>
            <strong>{winningCount}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>{tp('myBids.outbidBids')}</span>
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
          {tp('myBids.filterAll')}
        </button>
        <button
          type="button"
          className={`${styles.filterBtn} ${statusFilter === 'winning' ? styles.filterBtnActive : ''}`}
          onClick={() => setStatusFilter('winning')}
        >
          {tp('myBids.filterWinning')}
        </button>
        <button
          type="button"
          className={`${styles.filterBtn} ${statusFilter === 'outbid' ? styles.filterBtnActive : ''}`}
          onClick={() => setStatusFilter('outbid')}
        >
          {tp('myBids.filterOutbid')}
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>{tp('myBids.loading')}</div>
        ) : filteredBids.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>{tp('myBids.emptyTitle')}</h3>
            <p>
              {tp('myBids.emptySubtitle')}
            </p>
            <Link to="/auctions" className={styles.emptyAction}>
              {tp('myBids.exploreAuctions')}
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tp('myBids.vehicle')}</th>
                <th>{tp('myBids.bidAmount')}</th>
                <th>{tp('myBids.time')}</th>
                <th>{tp('myBids.state')}</th>
                <th>{tp('myBids.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBids.map((bid) => {
                const vehicleName = bid.productName || (bid.vehicle ? `${bid.vehicle.brand} ${bid.vehicle.model}` : tp('myBids.auctionIdFallback', { id: bid.auctionId.substring(0, 8) }));

                return (
                  <tr key={bid.id}>
                    <td>
                      <strong>{vehicleName}</strong>
                      <div className={styles.infoText}>{tp('myBids.bidId')}: #{bid.id.substring(0, 8)}</div>
                    </td>
                    <td className={styles.amount}>{formatCurrency(bid.amount)}</td>
                    <td>{new Date(bid.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      {bid.isWinning === true ? (
                        <span className={styles.badgeWinning}>{tp('myBids.winning')}</span>
                      ) : bid.isWinning === false ? (
                        <span className={styles.badgeOutbid}>{tp('myBids.outbid')}</span>
                      ) : (
                        <span className={styles.infoText}>{tp('myBids.recorded')}</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/auctions/${bid.auctionId}`} className={styles.tableActionLink}>
                        <Button variant="outline" size="small">{tp('myBids.viewAuction')}</Button>
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
