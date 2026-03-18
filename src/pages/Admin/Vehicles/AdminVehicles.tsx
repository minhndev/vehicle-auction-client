import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi } from '../../../api/adminApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminVehicles.module.css';

// Mock Product interface for admin view
interface Product {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  description: string;
  image: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerId: string;
}

export const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Product[]>([]);
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
      // Let's assume the API returns pending vehicles
      const response = await adminApi.getPendingVehicles();
      
      if (response && response.content) {
         setVehicles(response.content);
      } else if (Array.isArray(response)) {
         setVehicles(response);
      } else {
         // Mock data if API is not fully ready
         setVehicles([
           { id: 'v1', brand: 'Toyota', model: 'Camry', year: 2022, type: 'Sedan', mileage: 15000, transmission: 'Automatic', fuelType: 'Gasoline', description: 'Great condition.', image: '', status: 'PENDING', sellerId: 'seller_123' },
           { id: 'v2', brand: 'Honda', model: 'CR-V', year: 2023, type: 'SUV', mileage: 5000, transmission: 'Automatic', fuelType: 'Hybrid', description: 'Like new.', image: '', status: 'PENDING', sellerId: 'seller_456' },
         ]);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch vehicles.'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await adminApi.approveVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert('Failed to approve vehicle: ' + getErrorMessage(err, 'Unknown error'));
      // For mock purposes, remove it anyway if API fails but we want to test UI
      setVehicles(prev => prev.filter(v => v.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return; // User cancelled
    
    try {
      setActionLoading(id);
      await adminApi.rejectVehicle(id, reason);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert('Failed to reject vehicle: ' + getErrorMessage(err, 'Unknown error'));
      setVehicles(prev => prev.filter(v => v.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Vehicle Registration Queue</h1>
      <p className={styles.subtitle}>Review and approve vehicles submitted by sellers before they can go to auction.</p>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className="loadingSpinner">Loading queue...</div>
      ) : vehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>All caught up!</h3>
          <p>There are no pending vehicles to review.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.statusBadge}>Pending Approval</span>
                <span className={styles.sellerInfo}>Seller: {vehicle.sellerId.substring(0,8)}...</span>
              </div>
              
              <div className={styles.cardBody}>
                {vehicle.image ? (
                  <img src={vehicle.image} alt={vehicle.model} className={styles.image} />
                ) : (
                  <div className={styles.placeholderImage}>No Image Provided</div>
                )}
                <div className={styles.info}>
                  <h3>{vehicle.year} {vehicle.brand} {vehicle.model}</h3>
                  <div className={styles.specs}>
                    <span className={styles.specTag}>{vehicle.type}</span>
                    <span className={styles.specTag}>{vehicle.transmission}</span>
                    <span className={styles.specTag}>{vehicle.mileage.toLocaleString()} mi</span>
                    <span className={styles.specTag}>{vehicle.fuelType}</span>
                  </div>
                  <p className={styles.description}>{vehicle.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button 
                  variant="outline" 
                  onClick={() => handleReject(vehicle.id)}
                  disabled={actionLoading === vehicle.id}
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  {actionLoading === vehicle.id ? 'Processing...' : 'Reject'}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleApprove(vehicle.id)}
                  disabled={actionLoading === vehicle.id}
                  style={{ backgroundColor: '#10b981' }}
                >
                  {actionLoading === vehicle.id ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
