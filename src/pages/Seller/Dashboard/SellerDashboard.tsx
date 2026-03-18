import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import styles from './SellerDashboard.module.css';

export const SellerDashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Dashboard</h1>
          <p className={styles.subtitle}>Manage your vehicles and monitor active auctions.</p>
        </div>
        <Link to="/seller/auctions/new" style={{ textDecoration: 'none' }}>
           <Button variant="primary">Register New Vehicle</Button>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Active Listings</h3>
          <p className={styles.statValue}>12</p>
        </div>
        <div className={styles.statCard}>
          <h3>Vehicles Pending Approval</h3>
          <p className={styles.statValue}>3</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Sales</h3>
          <p className={styles.statValue}>$185,400</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed Auctions</h3>
          <p className={styles.statValue}>8</p>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
           <h2 style={{ color: 'var(--color-primary)' }}>Your Vehicles</h2>
           <Link to="/seller/auctions" style={{ color: 'var(--color-secondary)' }}>View All</Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Current Bid</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2021 BMW X5</td>
              <td><span className={styles.badgeActive}>Live Auction</span></td>
              <td>$45,000</td>
              <td>Oct 26, 2024</td>
              <td><Button variant="outline" size="small">View</Button></td>
            </tr>
            <tr>
              <td>2019 Toyota Camry</td>
              <td><span className={styles.badgePending}>Awaiting Approval</span></td>
              <td>-</td>
              <td>-</td>
              <td><Button variant="outline" size="small">Edit</Button></td>
            </tr>
            <tr>
              <td>2022 Tesla Model 3</td>
              <td><span className={styles.badgeEnded}>Ended (Sold)</span></td>
              <td>$38,500</td>
              <td>Oct 20, 2024</td>
              <td><Button variant="outline" size="small">Details</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
