import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { orderApi, type Order } from '../../../api/orderApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './MyOrders.module.css';

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getMyOrders();
      // Handle page response or array response
      if (response && response.content) {
        setOrders(response.content);
      } else if (Array.isArray(response)) {
        setOrders(response);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch your orders.'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Payment</span>;
      case 'PAID':
        return <span className={`${styles.badge} ${styles.badgePaid}`}>Paid - Preparing</span>;
      case 'SHIPPED':
        return <span className={`${styles.badge} ${styles.badgeShipped}`}>Shipped</span>;
      case 'DELIVERED':
        return <span className={`${styles.badge} ${styles.badgeDelivered}`}>Delivered</span>;
      case 'CANCELLED':
        return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Cancelled</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  if (loading) {
    return <div className={styles.container}><div className="loadingSpinner">Loading orders...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Orders</h1>
      <p className={styles.subtitle}>Track your auction winnings and payment status.</p>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No orders found</h3>
          <p>You haven't won any auctions yet.</p>
          <Button variant="primary" onClick={() => navigate('/auctions')}>Browse Auctions</Button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                  <span className={styles.orderDate}>Placed on {formatDate(order.createdAt)}</span>
                </div>
                {renderStatusBadge(order.status)}
              </div>
              
              <div className={styles.orderDetails}>
                <div className={styles.productInfo}>
                  <h4>{order.productName || 'Auction Vehicle'}</h4>
                  <p className={styles.auctionId}>Auction ID: {order.auctionId}</p>
                </div>
                <div className={styles.priceInfo}>
                  <p className={styles.totalLabel}>Total Amount</p>
                  <p className={styles.totalValue}>{formatCurrency(order.totalAmount || 0)}</p>
                </div>
              </div>

              <div className={styles.orderActions}>
                <Button variant="outline" onClick={() => navigate(`/user/orders/${order.id}/details`)}>
                  View Details
                </Button>
                {order.status === 'PENDING' && (
                  <Button variant="primary" onClick={() => navigate(`/user/orders/${order.id}/checkout`)}>
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
