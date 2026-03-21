import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { orderApi } from '../../../api/orderApi';
import type { OrderResponse } from '../../../types/index';
import styles from './MyOrders.module.css';

const formatVND = (amount?: number | null) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, { cls: string; label: string }> = {
    PENDING_PAYMENT: { cls: styles.badgePending, label: 'Chờ thanh toán' },
    PAID: { cls: styles.badgePaid, label: 'Đã thanh toán' },
    CANCELLED: { cls: styles.badgeCancelled, label: 'Đã huỷ' },
    REFUNDED: { cls: styles.badgeShipped, label: 'Đã hoàn tiền' },
  };
  const entry = map[status ?? ''] ?? { cls: '', label: status ?? '' };
  return <span className={`${styles.badge} ${entry.cls}`}>{entry.label}</span>;
};

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getMyOrders({ page: currentPage, size: 10 });
      setOrders(response.content ?? []);
      setTotalPages(response.totalPages ?? 1);
    } catch {
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đơn hàng của tôi</h1>
      <p className={styles.subtitle}>Theo dõi xe đã thắng đấu giá và trạng thái thanh toán.</p>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa thắng phiên đấu giá nào.</p>
          <Button variant="primary" onClick={() => navigate('/auctions')}>
            Xem đấu giá
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>
                      Đơn #{order.id?.substring(0, 8).toUpperCase()}
                    </span>
                    <span className={styles.orderDate}>
                      &nbsp;·&nbsp;Ngày: {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.productInfo}>
                    <h4>{order.productName ?? 'Xe đấu giá'}</h4>
                    <p className={styles.auctionId}>Mã đấu giá: {order.auctionId}</p>
                    {order.shippingAddress && (
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        📍 {order.shippingAddress}
                      </p>
                    )}
                  </div>
                  <div className={styles.priceInfo}>
                    <div style={{ marginBottom: '4px' }}>
                      <span className={styles.totalLabel}>Giá thắng:</span>
                      <span className={styles.totalValue}>{formatVND(order.winningPrice)}</span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span className={styles.totalLabel}>Tiền cọc:</span>
                      <span style={{ fontWeight: 500 }}>{formatVND(order.depositAmount)}</span>
                    </div>
                    <div>
                      <span className={styles.totalLabel}>Còn lại:</span>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>
                        {formatVND(order.remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  {order.status === 'PENDING_PAYMENT' && (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/user/orders/${order.id}/checkout`)}
                    >
                      Thanh toán ngay
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/orders/${order.id}/checkout`)}
                  >
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Trang trước
              </Button>
              <span style={{ lineHeight: '36px', color: '#6b7280' }}>
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
