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

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch currently ACTIVE auctions
      const response = await auctionApi.getPublicAuctions({ page: 0, size: 50, status: 'ACTIVE' });
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
                <tr><td colSpan={6} className={styles.emptyRow} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có phiên đấu giá nào đang ACTIVE</td></tr>
              ) : (
                auctions.map(auction => {
                  const isLive = auction.status === 'ACTIVE';
                  
                  return (
                    <tr key={auction.id} className={!isLive ? styles.rowEnded : ''}>
                      <td><span className={styles.mono}>#{String(auction.id).substring(0, 8)}</span></td>
                      <td><strong>{auction.productName || 'Không rõ xe'}</strong></td>
                      <td className={styles.money} style={{ fontWeight: 'bold' }}>
                        {formatCurrency(auction.currentPrice)}
                      </td>
                      <td>{auction.endTime ? new Date(auction.endTime).toLocaleString('vi-VN') : '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${isLive ? styles.badgeLive : styles.badgeEnded}`} style={{ 
                          backgroundColor: isLive ? '#3b82f6' : '#9ca3af',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                           {auction.status || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {isLive && (
                          <Button 
                            variant="danger" 
                            size="small" 
                            onClick={() => handleCancel(auction.id as string)}
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                          >
                            Ép Buộc Huỷ
                          </Button>
                        )}
                        {!isLive && <span className={styles.textMuted} style={{ color: '#9ca3af' }}>Đã đóng</span>}
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
