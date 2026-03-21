import React from 'react';
import styles from '../Home.module.css';

// Giả lập cấu trúc dữ liệu cho luồng quy trình (Process Steps)
interface ProcessStep {
  id: number;
  title: string;
  description: string;
  iconUrl: string;
}

const MOCK_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: "Sign Up",
    description: "No credit card requried",
    iconUrl: "https://img.icons8.com/color/96/000000/add-user-group-man-man.png"
  },
  {
    id: 2,
    title: "Bid",
    description: "Bidding is free only pay if you win",
    iconUrl: "https://img.icons8.com/color/96/000000/auction.png"
  },
  {
    id: 3,
    title: "Win",
    description: "Fun - Excitment - Great Deals",
    iconUrl: "https://img.icons8.com/color/96/000000/trophy.png"
  }
];

// Sub-component hiển thị từng bước
const ProcessStepCard: React.FC<{ data: ProcessStep }> = ({ data }) => {
  return (
    <div className={styles.workStepCard}>
      <div className={styles.workStepIconWrap}>
        <img 
          src={data.iconUrl} 
          alt={data.title} 
          className={styles.workStepIcon} 
        />
      </div>

      <h3 className={styles.workStepTitle}>
        {data.title}
      </h3>
      <p className={styles.workStepDescription}>
        {data.description}
      </p>
    </div>
  );
};

// Component Chính
const HowItWorksSection: React.FC = () => {
  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.howSection}`}>
      <div className={styles.container}>
        <div className={`${styles.titleBlock} ${styles.titleBlockNarrow} ${styles.howTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.howTitle}`}>
            How it work
          </h2>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>

          <p className={`${styles.subtitle} ${styles.howSubtitle}`}>
            Get the best deals on verified vehicles with transparent history reports and expert support. Get the best deals on verified vehicles with transparent history reports and expert support.
          </p>
        </div>

        <div className={styles.workStepsRow}>
          {MOCK_PROCESS_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <ProcessStepCard data={step} />
              
              {index < MOCK_PROCESS_STEPS.length - 1 && (
                <div className={styles.workArrowWrap}>
                  <svg viewBox="0 0 72 18" fill="none" className={styles.workArrowIcon} aria-hidden="true">
                    <path d="M1 9H68" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M61 2L68 9L61 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;

