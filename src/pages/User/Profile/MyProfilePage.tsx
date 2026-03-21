import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../store';
import styles from './MyProfilePage.module.css';

export const MyProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Auction Member';
  const initials = `${user?.firstName?.[0] ?? 'A'}${user?.lastName?.[0] ?? 'M'}`.toUpperCase();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>My Profile Page</p>
        <h1>{fullName}</h1>
        <p>Quan ly thong tin ca nhan, truy cap nhanh den bids, orders va wallet cua ban.</p>
      </section>

      <div className={styles.grid}>
        <article className={styles.profileCard}>
          <div className={styles.avatar}>{initials}</div>
          <h2>{fullName}</h2>
          <p>{user?.email || 'No email available'}</p>

          <div className={styles.metaList}>
            <div>
              <span>Role</span>
              <strong>{user?.role || 'USER'}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>Active</strong>
            </div>
            <div>
              <span>User ID</span>
              <strong>{user?.id ? user.id.slice(0, 8) : 'N/A'}</strong>
            </div>
          </div>
        </article>

        <article className={styles.quickCard}>
          <h3>Quick links</h3>
          <Link to="/user/bids">Bidding History</Link>
          <Link to="/user/orders">My Orders</Link>
          <Link to="/user/wallet/deposit">Deposit Wallet</Link>
          <Link to="/user/notifications">Notifications</Link>
        </article>

        <article className={styles.infoCard}>
          <h3>Profile completion</h3>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} />
          </div>
          <p>80% complete</p>
          <small>Them thong tin lien he va dia chi de tang do tin cay khi dau gia.</small>
        </article>
      </div>
    </div>
  );
};
