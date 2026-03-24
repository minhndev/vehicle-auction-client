import React from 'react';
import { ShieldCheck, Award, Headset } from 'lucide-react';
import styles from '../Home.module.css';

// Data Mock cho các phần tử lặp lại (Các lý do chọn dịch vụ)
// Do Group lựa chọn chỉ tập trung ở phần Header, mình đã setup sẵn mảng List Model để bạn tiện fetch API/CMS.
interface ReasonItem {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const MOCK_REASONS: ReasonItem[] = [
  {
    id: 1,
    title: "Best Secure",
    description: "Get the best deals on verified vehicles with transparent history reports and expert support.",
    icon: ShieldCheck
  },
  {
    id: 2,
    title: "High Quality",
    description: "Get the best deals on verified vehicles with transparent history reports and expert support.",
    icon: Award
  },
  {
    id: 3,
    title: "24/7 Support",
    description: "Get the best deals on verified vehicles with transparent history reports and expert support.",
    icon: Headset
  }
];

// Sub-component cho từng Card hiển thị
const ReasonCard: React.FC<{ data: ReasonItem }> = ({ data }) => {
  const Icon = data.icon;
  return (
    <div className={styles.whyCard}>
      <div className={styles.whyIconWrap}>
        <Icon className={styles.whyIcon} size={48} strokeWidth={1.5} color="#2e3d83" />
      </div>
      <h3 className={styles.whyTitle}>
        {data.title}
      </h3>
      <p className={styles.whyDescription}>
        {data.description}
      </p>
    </div>
  );
};

// Component Chính
const WhyChooseUsSection: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.whySection}`}>
      <div className={styles.container}>
        <div className={`${styles.titleBlock} ${styles.whyTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.whySectionTitle}`}>
            Why Choose us
          </h2>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>
        </div>

        <div className={styles.whyList}>
          {MOCK_REASONS.map((item) => (
            <ReasonCard key={item.id} data={item} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUsSection;

