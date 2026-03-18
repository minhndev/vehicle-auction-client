import React from 'react';
import styles from './AdminDashboard.module.css';

export const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Overview</h1>
        <p className={styles.subtitle}>Welcome to the administration panel.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statValue}>1,245</p>
          <span className={styles.trendUp}>+12% this month</span>
        </div>
        <div className={styles.statCard}>
          <h3>Active Auctions</h3>
          <p className={styles.statValue}>48</p>
          <span className={styles.trendUp}>+5% this week</span>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Approvals</h3>
          <p className={styles.statValue}>12</p>
          <span className={styles.trendDown}>Requires attention</span>
        </div>
        <div className={styles.statCard}>
          <h3>System Revenue</h3>
          <p className={styles.statValue}>$45,200</p>
          <span className={styles.trendUp}>+22% this month</span>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Registrations</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#USR-8821</td>
              <td>John Doe</td>
              <td>BUYER</td>
              <td>Oct 24, 2024</td>
              <td><span className={styles.badgeActive}>Active</span></td>
            </tr>
            <tr>
              <td>#USR-8822</td>
              <td>Jane Smith</td>
              <td>SELLER</td>
              <td>Oct 24, 2024</td>
              <td><span className={styles.badgePending}>Pending</span></td>
            </tr>
            <tr>
              <td>#USR-8823</td>
              <td>Mike Ross</td>
              <td>SELLER</td>
              <td>Oct 23, 2024</td>
              <td><span className={styles.badgeActive}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
