import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import styles from './SellerAuctions.module.css';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerProducts: React.FC = () => {
  const { getProductStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    mode: 'delete' | 'restore';
    id: string;
    title: string;
    message: string;
  } | null>(null);
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
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setVehicles(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={styles.badgePending}>{getProductStatusLabel('PENDING')}</span>;
      case 'APPROVED':
        return <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{getProductStatusLabel('APPROVED')}</span>;
      case 'IN_AUCTION':
        return <span className={styles.badgeActive}>{getProductStatusLabel('IN_AUCTION')}</span>;
      case 'REJECTED':
        return <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{getProductStatusLabel('REJECTED')}</span>;
      case 'SOLD':
        return <span style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{getProductStatusLabel('SOLD')}</span>;
      case 'CANCELLED':
        return <span style={{ backgroundColor: '#9ca3af', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{getProductStatusLabel('CANCELLED')}</span>;
      default:
        return <span className={styles.badgePending}>{getProductStatusLabel(status)}</span>;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoadingId(id);
      await sellerApi.deleteVehicle(id);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Không thể xóa sản phẩm');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setActionLoadingId(id);
      await sellerApi.restoreVehicle(id);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Không thể khôi phục sản phẩm');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.mode === 'delete') {
      await handleDelete(confirmModal.id);
    } else {
      await handleRestore(confirmModal.id);
    }
    setConfirmModal(null);
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
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <Link to="/seller/products/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Đăng sản phẩm mới</Button>
        </Link>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{getProductStatusLabel('ALL')}</option>
          <option value="PENDING">{getProductStatusLabel('PENDING')}</option>
          <option value="APPROVED">{getProductStatusLabel('APPROVED')}</option>
          <option value="IN_AUCTION">{getProductStatusLabel('IN_AUCTION')}</option>
          <option value="REJECTED">{getProductStatusLabel('REJECTED')}</option>
          <option value="SOLD">{getProductStatusLabel('SOLD')}</option>
          <option value="CANCELLED">{getProductStatusLabel('CANCELLED')}</option>
        </select>
        <input
          type="text"
          placeholder="Tìm theo hãng xe, mẫu xe..."
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hình Ảnh</th>
            <th>Thông tin sản phẩm</th>
            <th>Trạng Thái</th>
            <th>Giá Đề Xuất</th>
            <th>Ngày Đăng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td></tr>
          ) : filteredVehicles.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy sản phẩm nào.</td></tr>
          ) : (
            filteredVehicles.map(v => (
              <tr key={v.id}>
                <td>
                  {Array.isArray(v.images) && v.images.length > 0 ? (
                    <img src={typeof v.images[0] === 'string' ? v.images[0] : v.images[0]?.url} alt={v.model} className={styles.vehicleImage} />
                  ) : (
                      <div className={styles.placeholderImage}>Không có ảnh</div>
                  )}
                </td>
                <td>
                  <strong>{v.name || `${v.brand} ${v.model}`}</strong>
                    <div className={styles.subtext}>VIN: {v.vinNumber || 'Không có'}</div>
                </td>
                <td>{getStatusBadge(v.status)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatVND(v.startPrice)}</div>
                </td>
                <td>{v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {v.status === 'IN_AUCTION' || v.status === 'SOLD' ? (
                      <Button variant="outline" size="small" disabled title="Không thể chỉnh sửa khi sản phẩm đang đấu giá hoặc đã bán.">
                        Sửa (đã khóa)
                      </Button>
                    ) : (
                      <Link to={`/seller/products/${v.id}/edit`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="small" disabled={!v.id || actionLoadingId === v.id}>
                          Sửa
                        </Button>
                      </Link>
                    )}
                    {v.status === 'CANCELLED' ? (
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={!v.id || actionLoadingId === v.id}
                        onClick={() =>
                          v.id &&
                          setConfirmModal({
                            mode: 'restore',
                            id: v.id,
                            title: 'Khôi phục sản phẩm',
                            message: 'Sản phẩm sẽ được khôi phục và hiển thị lại trong danh sách hoạt động. Bạn muốn tiếp tục?',
                          })
                        }
                      >
                        {actionLoadingId === v.id ? 'Đang xử lý...' : 'Khôi phục'}
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="small"
                        disabled={!v.id || actionLoadingId === v.id}
                        onClick={() =>
                          v.id &&
                          setConfirmModal({
                            mode: 'delete',
                            id: v.id,
                            title: 'Xóa mềm sản phẩm',
                            message: 'Sản phẩm sẽ được chuyển sang trạng thái đã xóa mềm (CANCELLED). Bạn muốn tiếp tục?',
                          })
                        }
                      >
                        {actionLoadingId === v.id ? 'Đang xử lý...' : 'Xóa'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {confirmModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{confirmModal.title}</h3>
            <p className={styles.modalText}>{confirmModal.message}</p>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setConfirmModal(null)} disabled={!!actionLoadingId}>
                Hủy
              </Button>
              <Button
                variant={confirmModal.mode === 'delete' ? 'danger' : 'secondary'}
                onClick={confirmAction}
                disabled={!!actionLoadingId}
              >
                {actionLoadingId ? 'Đang xử lý...' : confirmModal.mode === 'delete' ? 'Xác nhận xóa' : 'Xác nhận khôi phục'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
