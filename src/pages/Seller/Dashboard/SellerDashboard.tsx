import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import type { ProductResponse } from '../../../types/index';
import styles from './SellerDashboard.module.css';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getMyVehicles();
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      // Sort to show newest first
      const sorted = list.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setVehicles(sorted);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING': return <span className={styles.badgePending}>Chờ Duyệt</span>;
      case 'APPROVED': return <span className={styles.badgeApproved} style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Đã Duyệt</span>;
      case 'IN_AUCTION': return <span className={styles.badgeActive}>Live Auction</span>;
      case 'REJECTED': return <span className={styles.badgeRejected} style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Bị Từ Chối</span>;
      case 'SOLD': return <span className={styles.badgeEnded} style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Đã Bán</span>;
      default: return <span className={styles.badgePending}>{status || 'N/A'}</span>;
    }
  };

  const activeCount = vehicles.filter(v => v.status === 'IN_AUCTION').length;
  const pendingCount = vehicles.filter(v => v.status === 'PENDING').length;
  const soldCount = vehicles.filter(v => v.status === 'SOLD').length;
  // Giả sử doanh thu là tổng startPrice (hoặc winningPrice nếu có API detail) của xe đã SOLD
  const totalSales = vehicles.filter(v => v.status === 'SOLD').reduce((sum, v) => sum + (v.startPrice || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Bán Hàng</h1>
          <p className={styles.subtitle}>Quản lý phương tiện và theo dõi trạng thái đấu giá của bạn.</p>
        </div>
          <Link to="/seller/products/new" style={{ textDecoration: 'none' }}>
           <Button variant="primary">Đăng Ký Đấu Giá Xe Mới</Button>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Đang Đấu Giá</h3>
          <p className={styles.statValue}>{loading ? '...' : activeCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Chờ Kiểm Duyệt</h3>
          <p className={styles.statValue} style={{ color: pendingCount > 0 ? '#f59e0b' : undefined }}>
            {loading ? '...' : pendingCount}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Tổng Doanh Thu (Ước tính)</h3>
          <p className={styles.statValue}>{loading ? '...' : formatVND(totalSales)}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Xe Đã Bán</h3>
          <p className={styles.statValue}>{loading ? '...' : soldCount}</p>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
           <h2 style={{ color: 'var(--color-primary)' }}>Xe Gần Đây</h2>
           <Link to="/seller/products" style={{ color: 'var(--color-secondary)' }}>Xem Tất Cả</Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Phương Tiện</th>
              <th>Trạng Thái</th>
              <th>Giá Đề Xuất</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>Đang tải...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>Chưa có xe nào. Hãy đăng ký một chiếc xe mới!</td></tr>
            ) : (
              vehicles.slice(0, 3).map(v => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.name || `${v.brand} ${v.model}`}</strong>
                  </td>
                  <td>{getStatusBadge(v.status)}</td>
                  <td>{formatVND(v.startPrice)}</td>
                  <td>{v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    {v.status === 'IN_AUCTION' || v.status === 'SOLD' ? (
                      <Button variant="outline" size="small" disabled title="Không thể chỉnh sửa khi sản phẩm đang đấu giá hoặc đã bán.">
                        Quản lý (đã khóa)
                      </Button>
                    ) : (
                      <Link to={`/seller/products/${v.id}/edit`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="small" disabled={!v.id}>
                          Quản lý
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
