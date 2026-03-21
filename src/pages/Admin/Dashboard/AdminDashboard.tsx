import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import styles from './AdminDashboard.module.css';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    auctions: 0,
    pending: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setLoading(true);
        // Call all necessary APIs in parallel to compute dashboard stats.
        // If APIs don't exist, they will swallow fail inside PromiseSettled.
        const [usersRes, auctionsRes, pendingRes] = await Promise.allSettled([
          adminApi.getUsers({ page: 0, size: 1 }),
          auctionApi.getPublicAuctions({ status: 'ACTIVE', page: 0, size: 1 }),
          adminApi.getPendingVehicles({ page: 0, size: 1 })
        ]);

        let uCount = 0, aCount = 0, pCount = 0;
        
        if (usersRes.status === 'fulfilled') {
          // @ts-ignore
          uCount = usersRes.value?.totalElements ?? (Array.isArray(usersRes.value) ? usersRes.value.length : 0);
        }
        if (auctionsRes.status === 'fulfilled') {
          // @ts-ignore
          aCount = auctionsRes.value?.totalElements ?? (Array.isArray(auctionsRes.value) ? auctionsRes.value.length : 0);
        }
        if (pendingRes.status === 'fulfilled') {
          // @ts-ignore
          pCount = pendingRes.value?.totalElements ?? (Array.isArray(pendingRes.value) ? pendingRes.value.length : 0);
        }

        setStats({
          users: uCount,
          auctions: aCount,
          pending: pCount,
          revenue: 14500000 // mock revenue for now since we don't have a specific endpoint for total system revenue tracking yet
        });
      } catch (err) {
        // silent fail - UI degrade gracefully to 0
      } finally {
        setLoading(false);
      }
    };
    fetchCounters();
  }, []);

  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng Quan Hệ Thống</h1>
        <p className={styles.subtitle}>Bảng điều khiển quản trị hệ thống đấu giá.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Tổng Người Dùng</h3>
          <p className={styles.statValue}>{loading ? '...' : stats.users}</p>
          <span className={styles.trendUp}>Hệ thống</span>
        </div>
        <div className={styles.statCard}>
          <h3>Đang Đấu Giá</h3>
          <p className={styles.statValue}>{loading ? '...' : stats.auctions}</p>
          <span className={styles.trendUp}>Đang Live (Active)</span>
        </div>
        <div className={styles.statCard}>
          <h3>Xe Chờ Kiểm Duyệt</h3>
          <p className={styles.statValue} style={{ color: stats.pending > 0 ? '#f59e0b' : undefined }}>
            {loading ? '...' : stats.pending}
          </p>
          <span className={styles.trendDown}>Cần Admin phản hồi</span>
        </div>
        <div className={styles.statCard}>
          <h3>Tổng Thu Nhập Nền Tảng</h3>
          <p className={styles.statValue}>{loading ? '...' : formatVND(stats.revenue)}</p>
          <span className={styles.trendUp}>(Tính năng WIP - Demo data)</span>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Trạng Thái Tương Tác System</h2>
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
          Tất cả biểu đồ và danh sách đăng nhập sẽ hiển thị ở phiên bản sau. <br/>
          Vui lòng dùng thanh Menu bên trên để xem trực tiếp Users, Vehicles và Auctions.
        </div>
      </div>
    </div>
  );
};
