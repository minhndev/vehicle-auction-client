import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuctionResponse } from '../../../../types/index';
import { useCountdown } from '../../../../hooks/useCountdown';
import { catalogApi } from '../../../../api/catalogApi';
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

const formatTime = (value?: string) => {
  if (!value) return 'Không xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không xác định';
  return date.toLocaleString('vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const timeLeft = useCountdown(auction.endTime ?? '');
  const totalBids = (auction as { totalBids?: number; bidCount?: number }).totalBids ?? (auction as { totalBids?: number; bidCount?: number }).bidCount ?? 0;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (auction.productId) {
      catalogApi.getProductById(auction.productId)
        .then((res: any) => {
          if (!active) return;
          let imgs = res?.images;
          if (!imgs && res?.data?.images) imgs = res.data.images;
          if (!imgs && res?.product?.images) imgs = res.product.images;
          
          if (Array.isArray(imgs) && imgs.length > 0) {
            const mainImg = imgs.find((i: any) => i.main || i.sortOrder === 0)?.url || imgs[0]?.url;
            if (mainImg) setImageUrl(mainImg);
          }
        })
        .catch(() => {
          // Ignore fetch errors
        });
    }
    return () => { active = false; };
  }, [auction.productId]);

  const isEnded =
    auction.status === 'COMPLETED' ||
    auction.status === 'CANCELLED' ||
    auction.status === 'FAILED' ||
    (!auction.active && auction.status !== 'UPCOMING');

  const statusKey = auction.status ?? '';
  const badgeLabel = statusLabel[statusKey] ?? statusKey;
  const vehicleName = auction.productName ?? 'Xe đấu giá';
  const shortAuctionId = String(auction.id ?? '').slice(0, 8).toUpperCase();
  const countdownText = timeLeft ? `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}` : '--:--:--';
  const isEndingSoon = !isEnded && auction.status !== 'UPCOMING' && Boolean(timeLeft && Number(timeLeft.hours) < 1);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={`${styles.statusBadge} ${styles[statusKey] ?? ''}`}>
          {badgeLabel}
        </span>
        <div className={`${styles.countdownChip} ${isEnded ? styles.countdownEnded : isEndingSoon ? styles.countdownSoon : ''}`}>
          {isEnded ? 'Đã kết thúc' : auction.status === 'UPCOMING' ? 'Sắp mở phiên' : `Còn ${countdownText}`}
        </div>
        <img
          src={imageUrl || FALLBACK_IMAGE}
          alt={vehicleName}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{vehicleName}</h3>
        <div className={styles.metaRow}>
          <span className={styles.metaTag}>Mã phiên #{shortAuctionId || '--------'}</span>
          <span className={styles.metaTag}>{totalBids} lượt trả giá</span>
          <span className={styles.metaTag}>Kết thúc: {formatTime(auction.endTime)}</span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceContainer}>
            <div>
              <div className={styles.priceLabel}>Giá hiện tại</div>
              <div className={styles.price}>{formatVND(auction.currentPrice)}</div>
            </div>
            <div className={styles.startPriceWrap}>
              <span className={styles.startPriceLabel}>Giá khởi điểm</span>
              <strong className={styles.startPriceValue}>{formatVND(auction.startPrice)}</strong>
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              variant={isEnded ? 'secondary' : 'primary'}
              size="small"
              className={styles.bidBtn}
              onClick={() => navigate(`/auctions/${auction.id}`)}
            >
              {isEnded ? 'Xem chi tiết' : auction.status === 'UPCOMING' ? 'Xem trước phiên' : 'Đặt giá ngay'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
