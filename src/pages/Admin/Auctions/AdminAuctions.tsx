import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { AuctionResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminAuctions.module.css';

const formatCurrency = (amount?: number) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const AdminAuctions: React.FC = () => {
  const { tp, getAuctionStatusLabel } = usePageI18n();
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED'>('ALL');

  useEffect(() => {
    fetchAuctions();
  }, [statusFilter]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auctionApi.getPublicAuctions({
        page: 0,
        size: 50,
        sort: 'createdAt,desc',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      });
      // @ts-ignore
      const list = response?.content || response || [];
      setAuctions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err, tp('adminAuctions.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm(tp('adminAuctions.cancelConfirm'))) return;
    
    const reason = window.prompt(tp('adminAuctions.cancelReasonPrompt'));
    if (!reason) return;

    try {
      await adminApi.cancelAuction(id, reason);
      setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      setTimeout(() => alert(tp('adminAuctions.cancelSuccess')), 100);
    } catch (err) {
      alert(`${tp('adminAuctions.cancelFailed')}: ${getErrorMessage(err, tp('adminAuctions.systemError'))}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('adminAuctions.title')}</h1>
      <p className={styles.subtitle}>{tp('adminAuctions.subtitle')}</p>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableCard}>
        {loading ? (
          <div className="loadingSpinner" style={{ padding: '2rem' }}>{tp('adminAuctions.loading')}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tp('adminAuctions.auctionCode')}</th>
                <th>{tp('adminAuctions.vehicleInfo')}</th>
                <th>{tp('adminAuctions.currentPrice')}</th>
                <th>{tp('adminAuctions.endTime')}</th>
                <th>{tp('adminAuctions.status')}</th>
                <th>{tp('adminAuctions.action')}</th>
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyRow} style={{ textAlign: 'center', padding: '2rem' }}>{tp('adminAuctions.empty')}</td></tr>
              ) : (
                auctions.map(auction => {
                  const canCancel = auction.status === 'ACTIVE' || auction.status === 'UPCOMING';
                  
                  return (
                    <tr key={auction.id} className={!canCancel ? styles.rowEnded : ''}>
                      <td><span className={styles.mono}>#{String(auction.id).substring(0, 8)}</span></td>
                      <td><strong>{auction.productName || tp('adminAuctions.unknownVehicle')}</strong></td>
                      <td className={styles.money} style={{ fontWeight: 'bold' }}>
                        {formatCurrency(auction.currentPrice)}
                      </td>
                      <td>{auction.endTime ? new Date(auction.endTime).toLocaleString('vi-VN') : '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${canCancel ? styles.badgeLive : styles.badgeEnded}`} style={{ 
                          backgroundColor: auction.status === 'ACTIVE' ? '#3b82f6' : auction.status === 'UPCOMING' ? '#f59e0b' : '#9ca3af',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                           {getAuctionStatusLabel(auction.status)}
                        </span>
                      </td>
                      <td>
                        {canCancel && (
                          <Button 
                            variant="danger" 
                            size="small" 
                            onClick={() => handleCancel(auction.id as string)}
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                          >
                            {tp('adminAuctions.forceCancel')}
                          </Button>
                        )}
                        {!canCancel && <span className={styles.textMuted} style={{ color: '#9ca3af' }}>{tp('adminAuctions.closed')}</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label htmlFor="auction-status-filter" style={{ fontWeight: 600 }}>{tp('adminAuctions.filterLabel')}</label>
        <select
          id="auction-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">{getAuctionStatusLabel('ALL')}</option>
          <option value="UPCOMING">{getAuctionStatusLabel('UPCOMING')}</option>
          <option value="ACTIVE">{getAuctionStatusLabel('ACTIVE')}</option>
          <option value="COMPLETED">{getAuctionStatusLabel('COMPLETED')}</option>
          <option value="CANCELLED">{getAuctionStatusLabel('CANCELLED')}</option>
          <option value="FAILED">{getAuctionStatusLabel('FAILED')}</option>
        </select>
      </div>
    </div>
  );
};
