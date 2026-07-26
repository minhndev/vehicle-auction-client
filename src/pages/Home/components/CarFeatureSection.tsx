import React from 'react';
import styles from '../Home.module.css';

// Cấu trúc Data chờ API mapping tính năng xe/lý do
interface FeatureItem {
  id: string;
  number: string;
  title: string;
}

const MOCK_FEATURES: FeatureItem[] = [
  { id: "1", number: "01", title: "Premium Vehicle Feature" },
  { id: "2", number: "02", title: "Premium Vehicle Feature" },
  { id: "3", number: "03", title: "Premium Vehicle Feature" },
  { id: "4", number: "04", title: "Premium Vehicle Feature" },
  { id: "5", number: "05", title: "Premium Vehicle Feature" },
  { id: "6", number: "06", title: "Premium Vehicle Feature" }
];

// Sub-component hiển thị từng hạng mục lặp lại
const FeatureCard: React.FC<{ data: FeatureItem }> = ({ data }) => {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureBadge}>
        <div className={styles.featureBadgeOuter}></div>
        <div className={styles.featureBadgeInner}></div>
        <span className={styles.featureBadgeNumber}>
          {data.number}
        </span>
      </div>
      <h3 className={styles.featureTitle}>
        {data.title}
      </h3>
    </div>
  );
};

// Component Chính (Toàn bộ Group 18978)
const CarFeatureSection: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.featureSection}`}>
      <div className={`${styles.containerWide} ${styles.featureContent}`}>
        
        {/* Khối Hình ảnh (Thay thế bằng placeholder và bg để đảm bảo bố cục) */}
        <div className={styles.featureImageWrap}>
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80" 
            alt="Car Features" 
            className={styles.featureImage} 
          />
        </div>

        <div className={styles.featureGrid}>
          {MOCK_FEATURES.map((item) => (
            <FeatureCard key={item.id} data={item} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CarFeatureSection;

