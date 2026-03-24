import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import type { AuctionResponse } from '../../../types';
import styles from '../Home.module.css';

interface Winner {
  id: string;
  name: string;
  image: string;
  wins: number;
  totalValue: number;
}

const maskId = (value: string) => {
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));
};

const toAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E3D83&color=ffffff&size=240`;
};

const normalizeWinners = (auctions: AuctionResponse[]): Winner[] => {
  const winnerMap = new Map<string, Winner>();

  auctions.forEach((item) => {
    const winnerId = String(item.winnerId ?? item.winnerEmail ?? '').trim();
    const winnerName = String(item.winnerName ?? item.winnerUsername ?? item.winnerEmail ?? '').trim();
    if (!winnerId || !winnerName) return;

    const existing = winnerMap.get(winnerId);
    const amount = Number(item.currentPrice ?? item.startPrice ?? 0);

    if (existing) {
      existing.wins += 1;
      existing.totalValue += Number.isFinite(amount) ? Math.max(0, amount) : 0;
      return;
    }

    winnerMap.set(winnerId, {
      id: winnerId,
      name: winnerName,
      image: toAvatarUrl(winnerName),
      wins: 1,
      totalValue: Number.isFinite(amount) ? Math.max(0, amount) : 0,
    });
  });

  return Array.from(winnerMap.values())
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalValue - a.totalValue;
    })
    .slice(0, 4);
};

const TopWinnerCard: React.FC<{ data: Winner }> = ({ data }) => {
  return (
    <div className={styles.topWinnerCard}>
      <div className={styles.topWinnerPill}>
        <img 
          src={data.image} 
          alt={data.name} 
          className={styles.topWinnerImage} 
        />
        
        <div className={styles.topWinnerInfo}>
          <h3 className={styles.topWinnerName}>
            {data.name}
          </h3>
          <p className={styles.topWinnerId}>
            {maskId(data.id)} · {data.wins} phiên thắng · {formatVND(data.totalValue)}
          </p>
        </div>
      </div>

      <button className={styles.topWinnerBagButton}>
        <ShoppingBag className={styles.topWinnerBagIcon} size={24} strokeWidth={2} color="#ffffff" />
      </button>

    </div>
  );
};

const TopWinnerSection: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTopWinners = async () => {
      try {
        const page = await auctionApi.getPublicAuctions({ status: 'COMPLETED', page: 0, size: 30, sort: 'updatedAt,desc' });
        const completedAuctions = Array.isArray(page?.content) ? page.content : [];
        if (!mounted) return;
        setWinners(normalizeWinners(completedAuctions));
      } catch {
        if (!mounted) return;
        setWinners([]);
      }
    };

    fetchTopWinners();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={`${styles.section} ${styles.sectionLight} ${styles.topWinnerSection}`}>
      <div className={styles.container}>
      <div className={styles.sectionColumnCenter}>
        
        {/* Header Title */}
        <div className={`${styles.titleBlock} ${styles.topWinnerTitleBlock}`}>
          <h2 className={`${styles.title} ${styles.topWinnerTitle}`}>
            Người thắng nổi bật
          </h2>
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerDot}></div>
          </div>
        </div>

        {/* Carousel Content */}
        <div className={styles.topWinnerCarousel}>
          <button className={`${styles.carouselArrowButton} ${styles.carouselArrowLeft}`}>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconBlack}>
              <path d="M6 1L1 6M1 6L6 11M1 6H25" />
            </svg>
          </button>

          <div className={styles.topWinnerCards}>
            {winners.length === 0 ? (
              <p className={styles.activityEmpty}>Chưa có dữ liệu người thắng để hiển thị.</p>
            ) : (
              winners.map((winner) => (
                <TopWinnerCard key={winner.id} data={winner} />
              ))
            )}
          </div>

          <button className={`${styles.carouselArrowButton} ${styles.carouselArrowRight}`}>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconBlack}>
              <path d="M20 1L25 6M25 6L20 11M25 6H1" />
            </svg>
          </button>
          
        </div>

      </div>
      </div>
    </section>
  );
};

export default TopWinnerSection;

