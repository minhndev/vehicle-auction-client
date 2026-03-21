import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import type { ProductResponse } from '../../../types/index';
import styles from './SellerAuctions.module.css';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerAuctions: React.FC = () => {
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerApi.getMyVehicles();
      // Ensure it's an array. If API returns pagination {content: []}, handle it
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setVehicles(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={styles.badgePending}>Chờ Duyệt</span>;
      case 'APPROVED':
        return <span className={styles.badgeApproved} style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Đã Duyệt</span>;
      case 'IN_AUCTION':
        return <span className={styles.badgeActive}>Đang Đấu Giá</span>;
      case 'REJECTED':
        return <span className={styles.badgeRejected} style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Bị Từ Chối</span>;
      case 'SOLD':
        return <span className={styles.badgeEnded} style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Đã Bán</span>;
      default:
        return <span className={styles.badgePending}>{status || 'N/A'}</span>;
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (search && !v.brand?.toLowerCase().includes(search.toLowerCase()) && !v.model?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản Lý Xe Đấu Giá</h1>
        <Link to="/seller/auctions/new" style={{ textDecoration: 'none' }}>
           <Button variant="primary">Đăng Ký Xe Mới</Button>
        </Link>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ Duyệt</option>
          <option value="APPROVED">Đã Duyệt</option>
          <option value="IN_AUCTION">Đang Đấu Giá</option>
          <option value="REJECTED">Bị Từ Chối</option>
          <option value="SOLD">Đã Bán</option>
        </select>
        <input 
          type="text" 
          placeholder="Tìm theo hãng xe, mẫu xe..." 
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hình Ảnh</th>
            <th>Thông Tin Xe</th>
            <th>Trạng Thái</th>
            <th>Đề Xuất VNĐ</th>
            <th>Ngày Đăng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td></tr>
          ) : filteredVehicles.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy xe nào.</td></tr>
          ) : (
            filteredVehicles.map(v => (
              <tr key={v.id}>
                <td>
                  {Array.isArray(v.images) && v.images.length > 0 ? (
                    <img src={typeof v.images[0] === 'string' ? v.images[0] : v.images[0]?.url} alt={v.model} className={styles.vehicleImage} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div className={styles.placeholderImage} style={{ width: '80px', height: '60px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '12px' }}>No Image</div>
                  )}
                </td>
                <td>
                  <strong>{v.name || `${v.brand} ${v.model}`}</strong>
                  <div className={styles.subtext} style={{ fontSize: '12px', color: '#6b7280' }}>VIN: {v.vinNumber || 'N/A'}</div>
                </td>
                <td>{getStatusBadge(v.status)}</td>
                <td>
                  {/* Xe mới có startPrice, Đấu giá đang chạy có currentPrice (nếu API gom chung) */}
                  <div style={{ fontWeight: 600 }}>{formatVND(v.startPrice)}</div>
                </td>
                <td>{v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td>
                  <Button variant="outline" size="small" onClick={() => alert(`Tính năng sửa/xóa ID: ${v.id} đang phát triển`)}>
                    Quản lý
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
