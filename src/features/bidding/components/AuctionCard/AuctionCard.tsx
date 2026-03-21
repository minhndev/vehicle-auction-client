import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuctionResponse } from '../../../../types/index';
import { useCountdown } from '../../../../hooks/useCountdown';
import { Button } from '../../../../components/ui/Button/Button';
import styles from './AuctionCard.module.css';

interface AuctionCardProps {
  auction: AuctionResponse;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const formatVND = (amount?: number) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusLabel: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ACTIVE: 'Đang đấu giá',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã huỷ',
  FAILED: 'Thất bại',
};

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const timeLeft = useCountdown(auction.endTime ?? '');
  const totalBids = (auction as { totalBids?: number; bidCount?: number }).totalBids ?? (auction as { totalBids?: number; bidCount?: number }).bidCount ?? 0;

  const isEnded =
    auction.status === 'COMPLETED' ||
    auction.status === 'CANCELLED' ||
    auction.status === 'FAILED' ||
    (!auction.active && auction.status !== 'UPCOMING');

  const statusKey = auction.status ?? '';
  const badgeLabel = statusLabel[statusKey] ?? statusKey;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={`${styles.statusBadge} ${styles[statusKey] ?? ''}`}>
          {badgeLabel}
        </span>
        <img
          src={FALLBACK_IMAGE}
          alt={auction.productName ?? 'Vehicle'}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{auction.productName ?? 'Xe đấu giá'}</h3>
        <p className={styles.excerpt}>
          Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.
        </p>

        <div className={styles.metaRow}>
          <span className={styles.metaTag}>ID #{String(auction.id).slice(0, 8)}</span>
          <span className={styles.metaTag}>{totalBids} bids</span>
        </div>

        <div className={styles.priceContainer}>
          <div>
            <div className={styles.priceLabel}>Giá hiện tại</div>
            <div className={styles.price}>{formatVND(auction.currentPrice)}</div>
          </div>
          <div className={styles.bidsCount}>
            Giá khởi điểm: {formatVND(auction.startPrice)}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {isEnded ? (
          <div className={`${styles.timer} ${styles.ended}`}>
            <span>Đã kết thúc</span>
          </div>
        ) : auction.status === 'UPCOMING' ? (
          <div className={styles.timer}>
            <span>⏰ Sắp diễn ra</span>
          </div>
        ) : (
          <div className={styles.timer}>
            <span role="img" aria-label="time">⏳</span>
            {timeLeft && (
              <span>
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            )}
          </div>
        )}
        <div className={styles.ctaWrap}>
          <Button
            variant={isEnded ? 'secondary' : 'primary'}
            size="small"
            className={styles.bidBtn}
            onClick={() => navigate(`/auctions/${auction.id}`)}
          >
            {isEnded ? 'Xem chi tiết' : 'Đấu giá ngay'}
          </Button>
        </div>
      </div>
    </div>
  );
};
