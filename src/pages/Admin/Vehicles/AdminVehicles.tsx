import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminVehicles.module.css';

export const AdminVehicles: React.FC = () => {
  const { tp, getProductStatusLabel } = usePageI18n();
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
      setError(getErrorMessage(err, tp('adminVehicles.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm(tp('adminVehicles.approveConfirm'))) return;
    try {
      setActionLoading(id);
      await adminApi.approveVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert(tp('adminVehicles.approveSuccess')), 100);
    } catch (err) {
      alert(`${tp('adminVehicles.approveFailed')}: ${getErrorMessage(err, tp('adminVehicles.unknownError'))}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(tp('adminVehicles.rejectReasonPrompt'));
    if (!reason) return; // Bị huỷ hoặc empty
    
    try {
      setActionLoading(id);
      await adminApi.rejectVehicle(id, reason);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert(tp('adminVehicles.rejectSuccess')), 100);
    } catch (err) {
      alert(`${tp('adminVehicles.rejectFailed')}: ${getErrorMessage(err, tp('adminVehicles.unknownError'))}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('adminVehicles.title')}</h1>
      <p className={styles.subtitle}>{tp('adminVehicles.subtitle')}</p>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loadingSpinner" style={{ padding: '2rem' }}>{tp('adminVehicles.loading')}</div>
      ) : vehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>{tp('adminVehicles.emptyTitle')}</h3>
          <p>{tp('adminVehicles.emptySubtitle')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.statusBadge}>{getProductStatusLabel('PENDING')}</span>
                <span className={styles.sellerInfo} title={vehicle.sellerId}>{tp('adminVehicles.sellerId')}: {vehicle.sellerId?.substring(0,8) || tp('adminVehicles.notAvailable')}</span>
              </div>
              
              <div className={styles.cardBody}>
                {Array.isArray(vehicle.images) && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0].url || ''} alt={vehicle.model} className={styles.image} />
                ) : (
                  <div className={styles.placeholderImage}>{tp('adminVehicles.noImage')}</div>
                )}
                <div className={styles.info}>
                  <h3>{vehicle.year || ''} {vehicle.brand} {vehicle.model}</h3>
                  <div className={styles.specs} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span className={styles.specTag}>VIN: {vehicle.vinNumber || tp('adminVehicles.notAvailable')}</span>
                    <span className={styles.specTag}>ODO: {(vehicle.mileage || 0).toLocaleString()} km</span>
                  </div>
                  <div style={{ marginTop: '12px', fontWeight: 600 }}>
                    {tp('adminVehicles.suggestedPrice')}: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.startPrice || vehicle.basePrice || 0)}
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
                  {actionLoading === vehicle.id ? tp('adminVehicles.processing') : tp('adminVehicles.reject')}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => vehicle.id && handleApprove(vehicle.id)}
                  disabled={actionLoading === vehicle.id || !vehicle.id}
                  style={{ backgroundColor: '#10b981' }}
                >
                  {actionLoading === vehicle.id ? tp('adminVehicles.processing') : tp('adminVehicles.approve')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
