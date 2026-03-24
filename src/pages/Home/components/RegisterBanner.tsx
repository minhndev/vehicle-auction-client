import React from 'react';
import { usePageI18n } from '../../../i18n/usePageI18n';
import styles from '../Home.module.css';

const RegisterBanner: React.FC = () => {
  const { tp } = usePageI18n();

  return (
    <section className={`${styles.sectionCompact} ${styles.sectionLight} ${styles.registerSection}`}>
      <div className={`${styles.containerWide} ${styles.overflowVisible}`}>
      <div className={styles.registerPanel}>
        
        {/* Content Block */}
        <div className={styles.registerContent}>
          
          <h2 className={styles.registerTitle}>
            {tp('registerBanner.title')}
          </h2>
          
          <p className={styles.registerDescription}>
            {tp('registerBanner.description')}
          </p>

          {/* Form Group */}
          <div className={styles.registerForm}>
            <input 
              type="email" 
              placeholder={tp('registerBanner.emailPlaceholder')} 
              className={styles.registerInput}
            />
            <button className={styles.registerButton}>
              {tp('registerBanner.registerNow')}
            </button>
          </div>

        </div>

        <img 
          src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1000&q=80" 
          alt={tp('registerBanner.carPlaceholderAlt')} 
          className={styles.registerImage} 
        />
        
      </div>
      </div>
    </section>
  );
};

export default RegisterBanner;

