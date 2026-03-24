import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AuctionResponse, CategoryResponse } from '../../../types';
import { useCountdown } from '../../../hooks/useCountdown';
import { getAuctionList, getHomeCategories } from './homeDataService';
import styles from '../Home.module.css';

const PLACEHOLDER_CAR_IMAGE = 'https://images.unsplash.com/photo-1549317661-bc41c8291eb0?auto=format&fit=crop&w=400&q=80';

const formatVND = (amount?: number) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface AuctionCar {
  id: string;
  name: string;
  image?: string;
  currentBid: number;
  endTime?: string;
  isTrending?: boolean;
}

// --- SUB COMPONENTS ---
const AuctionCarCard: React.FC<AuctionCar> = ({ id, name, image, currentBid, endTime, isTrending }) => {
  const countdown = useCountdown(endTime ?? '');
  const timeLeft = countdown
    ? `${countdown.hours} : ${countdown.minutes} : ${countdown.seconds}`
    : 'Đã kết thúc';

  return (
    <div className={styles.auctionCard}>
      <div className={styles.auctionCardTopCircle}>
        <div className={styles.auctionCardTopDot}></div>
      </div>

      {isTrending && (
        <div className={styles.auctionCardTrending}>
          Nổi bật
        </div>
      )}

      <h3 className={styles.auctionCardTitle}>{name}</h3>

      <div className={styles.auctionCardSeparator}></div>

      <div className={styles.auctionCardImageWrap}>
        <img src={image || PLACEHOLDER_CAR_IMAGE} alt={name} className={styles.auctionCardImage} />
      </div>

      <div className={styles.auctionCardMetaRow}>
        <div className={styles.auctionCardMetaCol}>
          <span className={styles.auctionCardMetaLabel}>Giá hiện tại</span>
          <span className={styles.auctionCardMetaValue}>{formatVND(currentBid)}</span>
        </div>
        <div className={styles.auctionCardMetaCol}>
          <span className={styles.auctionCardMetaLabel}>Thời gian còn lại</span>
          <span className={styles.auctionCardMetaValue}>{timeLeft}</span>
        </div>
      </div>

      <Link to={`/auctions/${id}`} className={styles.auctionCardButton}>
        Đặt giá ngay
      </Link>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const AuctionCarsSection: React.FC = () => {
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [activeTab, setActiveTab] = useState('');
  const [cars, setCars] = useState<AuctionCar[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const content = await getHomeCategories();
        const safeContent = Array.isArray(content) ? content : [];
        const normalized = safeContent.map((item: CategoryResponse) => ({
          id: String(item.id ?? ''),
          label: item.name ?? 'Danh mục',
        })).filter((item) => item.id);

        if (!mounted) return;
        if (normalized.length > 0) {
          setCategories(normalized);
          setActiveTab(normalized[0].id);
        } else {
          setCategories([{ id: 'ALL', label: 'Tất cả xe' }]);
          setActiveTab('ALL');
        }
      } catch {
        if (!mounted) return;
        setCategories([{ id: 'ALL', label: 'Tất cả xe' }]);
        setActiveTab('ALL');
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeTab) {
      setCars([]);
      return;
    }

    let mounted = true;
    const fetchAuctionsByCategory = async () => {
      try {
        const content = await getAuctionList(
          activeTab === 'ALL'
            ? { page: 0, size: 8, sort: 'createdAt,desc' }
            : { categoryId: activeTab, page: 0, size: 8, sort: 'createdAt,desc' },
        );

        if (!mounted) return;
        const mapped = content.map((item: AuctionResponse, idx: number) => ({
          id: String(item.id ?? idx),
          name: item.productName ?? 'Phiên đấu giá',
          currentBid: Number(item.currentPrice ?? item.startPrice ?? 0),
          endTime: item.endTime,
          isTrending: idx < 3,
        }));
        setCars(mapped);
      } catch {
        if (!mounted) return;
        setCars([]);
      }
    };

    fetchAuctionsByCategory();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const hasCategories = useMemo(() => categories.length > 0, [categories.length]);

  return (
    <section className={`${styles.section} ${styles.sectionPrimary} ${styles.auctionBodySection}`}>
      <div className={styles.containerWide}>
      
      <div className={`${styles.titleBlock} ${styles.auctionBodyTitleBlock}`}>
      <h2 className={`${styles.title} ${styles.titleOnDark} ${styles.auctionBodyTitle}`}>Đấu giá xe theo danh mục</h2>

      <div className={styles.divider}>
        <div className={`${styles.dividerLine} ${styles.dividerWhiteLine}`}></div>
        <div className={`${styles.dividerDot} ${styles.dividerDiamond}`}></div>
      </div>
      </div>

      <div className={styles.auctionTabs}>
        <div className={styles.auctionTabsLine}></div>
        
        <div className={styles.auctionTabsRow}>
          {categories.map((type) => {
            const isActive = activeTab === type.id;
            return (
              <div 
                key={type.id} 
                className={`${styles.auctionTab} ${isActive ? styles.auctionTabActive : ''}`}
                onClick={() => setActiveTab(type.id)}
              >
                <span>{type.label}</span>
                {isActive && (
                  <div className={styles.auctionTabActiveLine}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.auctionCardsGrid}>
        {!hasCategories ? (
          <p className={styles.activityEmpty}>Chưa có danh mục để hiển thị phiên đấu giá.</p>
        ) : cars.length === 0 ? (
          <p className={styles.activityEmpty}>Chưa có phiên đấu giá cho danh mục này.</p>
        ) : (
          cars.map((car) => (
            <AuctionCarCard key={car.id} {...car} />
          ))
        )}
      </div>
      
      </div>
    </section>
  );
};

