import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import type { ProductResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminVehicles.module.css';

export const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getPendingVehicles();
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setVehicles(list);
    } catch (err) {
      setError(getErrorMessage(err, 'Lỗi tải danh sách xe chờ duyệt.'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT chiếc xe này? Sau khi duyệt xe có thể được mang ra Đấu giá.")) return;
    try {
      setActionLoading(id);
      await adminApi.approveVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert('Duyệt xe thành công!'), 100);
    } catch (err) {
      alert('Không thể duyệt xe: ' + getErrorMessage(err, 'Lỗi không xác định'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Nhập lý do từ chối (bắt buộc):");
    if (!reason) return; // Bị huỷ hoặc empty
    
    try {
      setActionLoading(id);
      await adminApi.rejectVehicle(id, reason);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert('Từ chối xe thành công!'), 100);
    } catch (err) {
      alert('Không thể từ chối xe: ' + getErrorMessage(err, 'Lỗi không xác định'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hàng Chờ Kiểm Duyệt Xe</h1>
      <p className={styles.subtitle}>Kiểm tra thông tin phương tiện do người bán đăng tải trước khi lên sàn.</p>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loadingSpinner" style={{ padding: '2rem' }}>Đang tải hàng chờ...</div>
      ) : vehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Tất cả đã hoàn tất!</h3>
          <p>Không có phương tiện mới nào cần duyệt.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.statusBadge}>Chờ Duyệt</span>
                <span className={styles.sellerInfo} title={vehicle.sellerId}>ID Người Bán: {vehicle.sellerId?.substring(0,8) || 'N/A'}</span>
              </div>
              
              <div className={styles.cardBody}>
                {Array.isArray(vehicle.images) && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0].url || ''} alt={vehicle.model} className={styles.image} />
                ) : (
                  <div className={styles.placeholderImage}>Không có hình ảnh</div>
                )}
                <div className={styles.info}>
                  <h3>{vehicle.year || ''} {vehicle.brand} {vehicle.model}</h3>
                  <div className={styles.specs} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span className={styles.specTag}>VIN: {vehicle.vinNumber || 'N/A'}</span>
                    <span className={styles.specTag}>ODO: {(vehicle.mileage || 0).toLocaleString()} km</span>
                  </div>
                  <div style={{ marginTop: '12px', fontWeight: 600 }}>
                    Đề xuất: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.startPrice || vehicle.basePrice || 0)}
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button 
                  variant="outline" 
                  onClick={() => vehicle.id && handleReject(vehicle.id)}
                  disabled={actionLoading === vehicle.id || !vehicle.id}
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  {actionLoading === vehicle.id ? 'Loading...' : 'Từ Chối'}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => vehicle.id && handleApprove(vehicle.id)}
                  disabled={actionLoading === vehicle.id || !vehicle.id}
                  style={{ backgroundColor: '#10b981' }}
                >
                  {actionLoading === vehicle.id ? 'Loading...' : 'Duyệt Vào Sàn'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
