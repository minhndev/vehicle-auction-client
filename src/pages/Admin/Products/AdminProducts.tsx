import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import type { ProductResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminProducts.module.css';

const getBadgeColor = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return '#f59e0b';
    case 'APPROVED':
      return '#10b981';
    case 'IN_AUCTION':
      return '#3b82f6';
    case 'REJECTED':
      return '#ef4444';
    case 'SOLD':
      return '#6b7280';
    case 'CANCELLED':
      return '#9ca3af';
    default:
      return '#64748b';
  }
};

const formatVND = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

export const AdminProducts: React.FC = () => {
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getProducts({
        page: 0,
        size: 100,
        sort: 'createdAt,desc',
        ...(status !== 'all' ? { status } : {}),
        ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
      });
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách product.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [status]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Duyệt product này?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.approveVehicle(id);
      await fetchItems();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể duyệt product.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      setActionLoadingId(id);
      await adminApi.rejectVehicle(id, reason);
      await fetchItems();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể từ chối product.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa mềm product này?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.deleteProduct(id);
      await fetchItems();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa product.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm('Khôi phục product này?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.restoreProduct(id);
      await fetchItems();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể khôi phục product.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Product Đã Đăng</h1>
      <p className={styles.subtitle}>Theo dõi toàn bộ product của seller, không chỉ hàng chờ duyệt.</p>

      <div className={styles.filters}>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="IN_AUCTION">IN_AUCTION</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SOLD">SOLD</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <input
          className={styles.input}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên/brand/model"
        />
        <Button variant="outline" onClick={fetchItems}>Tìm</Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Product</th>
              <th>Seller</th>
              <th>Trạng thái</th>
              <th>Giá đề xuất</th>
              <th>Ngày đăng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.empty}>Đang tải dữ liệu...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>Không có product nào.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.images?.[0]?.url ? (
                      <img className={styles.thumb} src={item.images[0].url} alt={item.name || 'product'} />
                    ) : (
                      <div className={styles.thumb} />
                    )}
                  </td>
                  <td>
                    <strong>{item.name || `${item.brand || ''} ${item.model || ''}`.trim() || 'N/A'}</strong>
                    <div style={{ color: '#64748b', fontSize: 12 }}>VIN: {item.vinNumber || 'N/A'}</div>
                  </td>
                  <td>{item.sellerId ? String(item.sellerId).slice(0, 8) : 'N/A'}</td>
                  <td>
                    <span className={styles.badge} style={{ background: getBadgeColor(item.status) }}>
                      {item.status || 'N/A'}
                    </span>
                  </td>
                  <td>{formatVND(item.startPrice || item.basePrice)}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {item.status === 'PENDING' && item.id && (
                        <>
                          <Button size="small" variant="primary" disabled={actionLoadingId === item.id} onClick={() => handleApprove(item.id as string)}>
                            Duyệt
                          </Button>
                          <Button size="small" variant="outline" disabled={actionLoadingId === item.id} onClick={() => handleReject(item.id as string)}>
                            Từ chối
                          </Button>
                        </>
                      )}

                      {item.status === 'CANCELLED' && item.id ? (
                        <Button size="small" variant="secondary" disabled={actionLoadingId === item.id} onClick={() => handleRestore(item.id as string)}>
                          Khôi phục
                        </Button>
                      ) : item.id ? (
                        <Button size="small" variant="danger" disabled={actionLoadingId === item.id} onClick={() => handleDelete(item.id as string)}>
                          Xóa mềm
                        </Button>
                      ) : null}
                    </div>
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
