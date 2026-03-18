import React from 'react';
import { Link } from 'react-router-dom';
import { store } from '../../../store';
import styles from './UserDashboard.module.css';

export const UserDashboard: React.FC = () => {
  const user = store.getState().auth.user;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Dashboard</h1>
      <p className={styles.welcome}>Welcome back, {user?.firstName} {user?.lastName}!</p>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Active Bids</h3>
          <p className={styles.statValue}>3</p>
        </div>
        <div className={styles.statCard}>
          <h3>Won Auctions</h3>
          <p className={styles.statValue}>1</p>
        </div>
        <div className={styles.statCard}>
          <h3>Watchlist</h3>
          <p className={styles.statValue}>5</p>
        </div>
        <div className={styles.statCard}>
          <h3>Wallet Balance</h3>
          <p className={styles.statValue}>$1,250.00</p>
        </div>
      </div>

      <div className={styles.actionsGrid}>
        <Link to="/user/wallet/deposit" className={styles.actionCard}>
          <div className={styles.actionIcon}>💳</div>
          <h3>Deposit Funds</h3>
          <p>Add money to your bidding wallet via VNPay</p>
        </Link>
        <Link to="/user/bids" className={styles.actionCard}>
          <div className={styles.actionIcon}>⚖️</div>
          <h3>My Bids</h3>
          <p>View your active and past bids</p>
        </Link>
        <Link to="/user/orders" className={styles.actionCard}>
          <div className={styles.actionIcon}>📦</div>
          <h3>My Orders</h3>
          <p>Checkout and track your won vehicles</p>
        </Link>
      </div>
    </div>
  );
};
