import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import styles from './SellerAuctions.module.css';

export const SellerAuctions: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Vehicles & Auctions</h1>
        <Link to="/seller/auctions/new" style={{ textDecoration: 'none' }}>
           <Button variant="primary">Register New Vehicle</Button>
        </Link>
      </div>

      <div className={styles.filters}>
        <select className={styles.filterSelect}>
          <option value="all">All Statuses</option>
          <option value="active">Live Auctions</option>
          <option value="pending">Pending Approval</option>
          <option value="ended">Ended</option>
        </select>
        <input type="text" placeholder="Search by model or brand..." className={styles.searchInput} />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle Image</th>
            <th>Details</th>
            <th>Status</th>
            <th>Current Bid</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&h=100&fit=crop" alt="BMW" className={styles.vehicleImage} />
            </td>
            <td>
              <strong>2021 BMW X5</strong>
              <div className={styles.subtext}>VIN: WBAJB1C54M*******</div>
            </td>
            <td><span className={styles.badgeActive}>Live Auction</span></td>
            <td>$45,000</td>
            <td>Oct 26, 2024</td>
            <td>
              <Button variant="outline" size="small">Manage</Button>
            </td>
          </tr>
          <tr>
            <td>
              <div className={styles.placeholderImage}>No Image</div>
            </td>
            <td>
              <strong>2019 Toyota Camry</strong>
              <div className={styles.subtext}>VIN: 4T1B11HK5K*******</div>
            </td>
            <td><span className={styles.badgePending}>Pending Approval</span></td>
            <td>-</td>
            <td>-</td>
            <td>
              <Button variant="outline" size="small">Edit</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
