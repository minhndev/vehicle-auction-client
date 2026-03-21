import React from 'react';
import styles from '../Home.module.css';

const RegisterBanner: React.FC = () => {
  return (
    <section className={`${styles.sectionCompact} ${styles.sectionLight} ${styles.registerSection}`}>
      <div className={`${styles.containerWide} ${styles.overflowVisible}`}>
      <div className={styles.registerPanel}>
        
        {/* Content Block */}
        <div className={styles.registerContent}>
          
          <h2 className={styles.registerTitle}>
            Register For Free & Start Biding Now!
          </h2>
          
          <p className={styles.registerDescription}>
            Sign up today to explore exclusive car auctions, verify your payment methods, and place your winning bids instantly without any hidden fees.
          </p>

          {/* Form Group */}
          <div className={styles.registerForm}>
            <input 
              type="email" 
              placeholder="Enter Your email address" 
              className={styles.registerInput}
            />
            <button className={styles.registerButton}>
              Register now
            </button>
          </div>

        </div>

        <img 
          src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1000&q=80" 
          alt="Car Placeholder" 
          className={styles.registerImage} 
        />
        
      </div>
      </div>
    </section>
  );
};

export default RegisterBanner;

