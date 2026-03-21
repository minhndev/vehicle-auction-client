import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { orderApi } from '../../../api/orderApi';
import { notificationApi } from '../../../api/notificationApi';
import styles from './UserDashboard.module.css';

export const UserDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, unreadRes] = await Promise.allSettled([
          orderApi.getMyOrders({ page: 0, size: 1 }),
          notificationApi.getUnreadCount(),
        ]);

        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value.content ?? [];
          const pending = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;
          setPendingOrders(ordersRes.value.totalElements ?? pending);
        }
        if (unreadRes.status === 'fulfilled') {
          setUnreadNotifications(Number(unreadRes.value) || 0);
        }
      } catch {
        // fail silently — UI degrades gracefully
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      icon: '📦',
      label: 'Đơn hàng chờ thanh toán',
      value: loadingStats ? '…' : pendingOrders,
      to: '/user/orders',
      highlight: pendingOrders > 0,
    },
    {
      icon: '🔔',
      label: 'Thông báo chưa đọc',
      value: loadingStats ? '…' : unreadNotifications,
      to: '/user/notifications',
      highlight: unreadNotifications > 0,
    },
    {
      icon: '❤️',
      label: 'Danh sách quan tâm',
      value: '—',
      to: '/user/watchlist',
      highlight: false,
    },
    {
      icon: '⚖️',
      label: 'Lịch sử đặt giá',
      value: '—',
      to: '/user/bids',
      highlight: false,
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.welcome}>
        Chào mừng trở lại, <strong>{user?.firstName} {user?.lastName}</strong>!
      </p>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <Link key={card.label} to={card.to} style={{ textDecoration: 'none' }}>
            <div
              className={styles.statCard}
              style={card.highlight ? { borderColor: '#dc2626', borderWidth: '2px' } : undefined}
            >
              <span style={{ fontSize: '28px' }}>{card.icon}</span>
              <h3 style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0 4px' }}>{card.label}</h3>
              <p
                className={styles.statValue}
                style={card.highlight ? { color: '#dc2626' } : undefined}
              >
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        <Link to="/user/wallet/deposit" className={styles.actionCard}>
          <div className={styles.actionIcon}>💳</div>
          <h3>Nộp tiền cọc</h3>
          <p>Nộp cọc để tham gia phiên đấu giá qua VNPay</p>
        </Link>
        <Link to="/user/orders" className={styles.actionCard}>
          <div className={styles.actionIcon}>📦</div>
          <h3>Đơn hàng của tôi</h3>
          <p>Thanh toán và theo dõi xe đã thắng đấu giá</p>
        </Link>
        <Link to="/auctions" className={styles.actionCard}>
          <div className={styles.actionIcon}>🔨</div>
          <h3>Tham gia đấu giá</h3>
          <p>Xem các phiên đấu giá đang diễn ra</p>
        </Link>
      </div>
    </div>
  );
};
