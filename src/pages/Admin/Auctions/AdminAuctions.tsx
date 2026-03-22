import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
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
      setError(getErrorMessage(err, 'Lỗi tải danh sách phiên đấu giá trực tiếp.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ HỦY BỎ ngay lập tức phiên đấu giá đang diễn ra. Chức năng này sẽ thông báo cho tất cả người tham gia và huỷ kết quả hiện tại. Bạn có chắc chắn?")) return;
    
    const reason = window.prompt("Nhập lý do huỷ bỏ phiên (bắt buộc, sẽ hiển thị cho user):");
    if (!reason) return;

    try {
      await adminApi.cancelAuction(id, reason);
      setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      setTimeout(() => alert('Đã huỷ phiên đấu giá thành công!'), 100);
    } catch (err) {
      alert('Không thể huỷ phiên: ' + getErrorMessage(err, 'Lỗi hệ thống'));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Phiên Đấu Giá (Live)</h1>
      <p className={styles.subtitle}>Giám sát và quản lý các phiên đấu giá đang diễn ra trên toàn hệ thống.</p>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.tableCard}>
        {loading ? (
          <div className="loadingSpinner" style={{ padding: '2rem' }}>Đang tải danh sách trực tiếp...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Đấu Giá</th>
                <th>Thông Tin Phương Tiện</th>
                <th>Giá Hiện Tại</th>
                <th>Thời Gian Kết Thúc</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyRow} style={{ textAlign: 'center', padding: '2rem' }}>Không có phiên đấu giá nào theo bộ lọc hiện tại</td></tr>
              ) : (
                auctions.map(auction => {
                  const canCancel = auction.status === 'ACTIVE' || auction.status === 'UPCOMING';
                  
                  return (
                    <tr key={auction.id} className={!canCancel ? styles.rowEnded : ''}>
                      <td><span className={styles.mono}>#{String(auction.id).substring(0, 8)}</span></td>
                      <td><strong>{auction.productName || 'Không rõ xe'}</strong></td>
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
                           {auction.status || 'N/A'}
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
                            Ép Buộc Huỷ
                          </Button>
                        )}
                        {!canCancel && <span className={styles.textMuted} style={{ color: '#9ca3af' }}>Đã đóng</span>}
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
        <label htmlFor="auction-status-filter" style={{ fontWeight: 600 }}>Lọc trạng thái:</label>
        <select
          id="auction-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">Tất cả</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>
    </div>
  );
};
