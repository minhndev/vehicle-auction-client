import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AuctionResponse } from '../../../types';
import { useCountdown } from '../../../hooks/useCountdown';
import { getAuctionList, getUpcomingAuctions } from './homeDataService';
import styles from '../Home.module.css';

const PLACEHOLDER_CAR_IMAGE = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80';

const formatVND = (amount?: number) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- SUB-COMPONENTS ---
const LiveAuctionCard: React.FC<{ data: AuctionResponse; isLiveTab: boolean }> = ({ data, isLiveTab }) => {
  const countdown = useCountdown((isLiveTab ? data.endTime : data.startTime) ?? '');

  const timeText = countdown
    ? `${countdown.hours}H : ${countdown.minutes}M : ${countdown.seconds}S`
    : isLiveTab
      ? 'Đã kết thúc'
      : 'Sắp bắt đầu';

  return (
    <div className={styles.liveCard}>
      <div className={styles.liveBadge}>{isLiveTab ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}</div>
      <div className={styles.liveImageWrap}>
        <img src={PLACEHOLDER_CAR_IMAGE} alt={data.productName ?? 'Xe đấu giá'} className={styles.liveImage} />
      </div>

      <div className={styles.liveContent}>
        <h3 className={styles.liveCarName}>{data.productName ?? 'Phiên đấu giá'}</h3>

        <div className={styles.livePriceRow}>
          <div className={styles.livePriceCol}>
            <span className={styles.livePriceLabel}>Giá hiện tại</span>
            <span className={styles.livePriceValue}>{formatVND(data.currentPrice ?? data.startPrice)}</span>
          </div>
          <div className={styles.livePriceDivider}></div>
          <div className={styles.livePriceCol}>
            <span className={styles.livePriceLabel}>Tiền cọc</span>
            <span className={styles.livePriceValue}>{formatVND(data.depositAmount)}</span>
          </div>
        </div>

        <div className={styles.liveTimeRow}>
          <span className={styles.liveTimeTag}>{isLiveTab ? 'Kết thúc sau' : 'Bắt đầu sau'}</span>
          <span className={styles.liveTimeValue}>{timeText}</span>
        </div>

        <Link to={`/auctions/${data.id}`} className={styles.liveBidButton}>
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export const LiveAuction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [liveAuctions, setLiveAuctions] = useState<AuctionResponse[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionResponse[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [livePage, upcomingPage] = await Promise.all([
          getAuctionList({ status: 'ACTIVE', page: 0, size: 4 }),
          getUpcomingAuctions(4),
        ]);

        if (!mounted) return;
        setLiveAuctions(livePage);
        setUpcomingAuctions(upcomingPage);
      } catch {
        if (!mounted) return;
        setLiveAuctions([]);
        setUpcomingAuctions([]);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const currentList = useMemo(
    () => (activeTab === 'live' ? liveAuctions : upcomingAuctions),
    [activeTab, liveAuctions, upcomingAuctions],
  );

  return (
    <section className={`${styles.section} ${styles.sectionPrimary} ${styles.liveSection}`}>
      <div className={styles.container}>
      <div className={`${styles.titleBlock} ${styles.liveTitleBlock}`}>
        <h2 className={`${styles.title} ${styles.titleOnDark} ${styles.liveTitle}`}>
          Phiên đấu giá trực tiếp
        </h2>
        <div className={styles.divider}>
            <div className={`${styles.dividerLine} ${styles.liveTitleDividerLine}`}></div>
            <div className={styles.dividerDot}></div>
        </div>
      </div>

      <div className={styles.liveTabsWrap}>
        <div className={styles.liveTabsRow}>
            <button
              className={activeTab === 'live' ? styles.liveTabActive : styles.liveTabIdle}
              onClick={() => setActiveTab('live')}
            >
              Đang diễn ra
            </button>
            <button
              className={activeTab === 'upcoming' ? styles.liveTabActive : styles.liveTabIdle}
              onClick={() => setActiveTab('upcoming')}
            >
              Sắp diễn ra
            </button>
        </div>
      </div>

      <div className={styles.liveCardGrid}>
        {currentList.length === 0 ? (
          <p className={styles.activityEmpty}>Chưa có phiên đấu giá phù hợp.</p>
        ) : (
          currentList.map((item) => (
            <LiveAuctionCard key={String(item.id)} data={item} isLiveTab={activeTab === 'live'} />
          ))
        )}
      </div>

      </div>
    </section>
  );
};

export default LiveAuction;

