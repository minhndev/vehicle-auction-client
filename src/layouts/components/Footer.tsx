import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            Auto<span className={styles.logoAccent}>Bid</span>
          </div>
          <p className={styles.description}>
            The most trusted platform for online vehicle auctions. 
            Find, bid, and win your dream car with transparency and security.
          </p>
          <div>
            <strong>Contact:</strong> support@autobid.example.com<br />
            <strong>Phone:</strong> 1-800-555-0199
          </div>
        </div>

        <div>
          <h4 className={styles.heading}>Quick Links</h4>
          <ul className={styles.linksList}>
            <li><Link to="/auctions" className={styles.link}>Browse Auctions</Link></li>
            <li><Link to="/how-it-works" className={styles.link}>How it Works</Link></li>
            <li><Link to="/pricing" className={styles.link}>Pricing & Fees</Link></li>
            <li><Link to="/about" className={styles.link}>About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.heading}>Categories</h4>
          <ul className={styles.linksList}>
            <li><Link to="/auctions?category=suv" className={styles.link}>SUVs</Link></li>
            <li><Link to="/auctions?category=sedan" className={styles.link}>Sedans</Link></li>
            <li><Link to="/auctions?category=truck" className={styles.link}>Trucks</Link></li>
            <li><Link to="/auctions?category=electric" className={styles.link}>Electric Vehicles</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.heading}>Legal</h4>
          <ul className={styles.linksList}>
            <li><Link to="/terms" className={styles.link}>Terms of Service</Link></li>
            <li><Link to="/privacy" className={styles.link}>Privacy Policy</Link></li>
            <li><Link to="/auctions-rules" className={styles.link}>Auction Rules</Link></li>
            <li><Link to="/faq" className={styles.link}>FAQs</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} AutoBid Vehicle Auctions. All rights reserved.</p>
        <div>
          {/* Placeholder for social icons */}
          <span style={{ marginRight: '1rem' }}>Facebook</span>
          <span style={{ marginRight: '1rem' }}>Twitter</span>
          <span>Instagram</span>
        </div>
      </div>
    </footer>
  );
};
