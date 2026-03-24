import React, { useEffect, useState } from 'react';
import { Users, Gavel, Trophy } from 'lucide-react';
import { getAuctionList, getHomeCategories, getUpcomingAuctions } from './homeDataService';
import styles from '../Home.module.css';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const getProcessSteps = (stats: {
  categoryCount: number;
  scheduledCount: number;
  activeCount: number;
  completedCount: number;
}): ProcessStep[] => {
  return [
    {
      id: 1,
      title: 'Tạo tài khoản & chọn xe',
      description: `${stats.categoryCount} danh mục xe, ${stats.scheduledCount} phiên sắp mở.`,
      icon: Users,
    },
    {
      id: 2,
      title: 'Đặt cọc & đấu giá',
      description: `${stats.activeCount} phiên đang diễn ra realtime.`,
      icon: Gavel,
    },
    {
      id: 3,
      title: 'Thắng phiên & hoàn tất đơn',
      description: `${stats.completedCount} phiên đã hoàn thành thành công.`,
      icon: Trophy,
    },
  ];
};

const ProcessStepCard: React.FC<{ data: ProcessStep }> = ({ data }) => {
  const Icon = data.icon;
  return (
    <div className={styles.workStepCard}>
      <div className={styles.workStepIconWrap}>
        <Icon className={styles.workStepIcon} size={48} strokeWidth={1.5} color="#2e3d83" />
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

const HowItWorksSection: React.FC = () => {
  const [steps, setSteps] = useState<ProcessStep[]>(
    getProcessSteps({
      categoryCount: 0,
      scheduledCount: 0,
      activeCount: 0,
      completedCount: 0,
    }),
  );

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const [categories, activeList, upcomingList, completedList] = await Promise.all([
          getHomeCategories(),
          getAuctionList({ status: 'ACTIVE', page: 0, size: 200 }),
          getUpcomingAuctions(200),
          getAuctionList({ status: 'COMPLETED', page: 0, size: 200 }),
        ]);

        if (!mounted) return;

        setSteps(
          getProcessSteps({
            categoryCount: Array.isArray(categories) ? categories.length : 0,
            activeCount: activeList.length,
            scheduledCount: upcomingList.length,
            completedCount: completedList.length,
          }),
        );
      } catch {
        if (!mounted) return;
        setSteps(
          getProcessSteps({
            categoryCount: 0,
            activeCount: 0,
            scheduledCount: 0,
            completedCount: 0,
          }),
        );
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.howSection}`}>
      <div className={styles.container}>
        <div className={`${styles.titleBlock} ${styles.titleBlockNarrow} ${styles.howTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.howTitle}`}>
            Cách thức hoạt động
          </h2>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>

          <p className={`${styles.subtitle} ${styles.howSubtitle}`}>
            Chọn xe đã được xác minh, theo dõi lịch sử minh bạch và tham gia đấu giá trực tuyến với cập nhật thời gian thực.
          </p>
        </div>

        <div className={styles.workStepsRow}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <ProcessStepCard data={step} />
              
              {index < steps.length - 1 && (
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

