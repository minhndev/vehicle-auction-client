import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { AuctionResponse, ProductResponse } from '../../types/index';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';
import { Button } from '../../components/ui/Button/Button';
import type { RootState } from '../../store';
import axiosClient from '../../api/axiosClient';
import styles from './AuctionDetail.module.css';

const formatVND = (amount?: number | null) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const auctionData = await auctionApi.getAuctionById(id);
        setAuction(auctionData);

        // Fetch product details for images
        if (auctionData.productId) {
          try {
            const productData: ProductResponse = await axiosClient.get(`/products/${auctionData.productId}`);
            setProduct(productData);
          } catch {
            // Product details optional — don't fail the page
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải thông tin đấu giá';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const { currentPrice: wsPrice, latestMessage, notification, isConnected } = useAuctionWebSocket(id ?? '');

  // Prefer real-time WS price over initial API price
  const displayPrice = wsPrice ?? auction?.currentPrice ?? auction?.startPrice ?? 0;
  const minNextBid = displayPrice + (auction?.bidIncrement ?? 0);

  const timeLeft = useCountdown(auction?.endTime ?? '');
  const isEnded =
    auction?.status === 'COMPLETED' ||
    auction?.status === 'CANCELLED' ||
    auction?.status === 'FAILED';

  const handlePlaceBid = async () => {
    setBidError('');
    setBidSuccess('');
    const amount = Number(bidAmount);

    if (!amount || isNaN(amount)) {
      setBidError('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (amount < minNextBid) {
      setBidError(`Giá đặt phải ít nhất ${formatVND(minNextBid)}`);
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBidLoading(true);
    try {
      // Use HTTP fallback (POST /auctions/{auctionId}/bids) as required by spec §7
      await auctionApi.placeBid(id!, { amount });
      setBidAmount('');
      setBidSuccess('Đặt giá thành công!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setBidError(axiosErr.response?.data?.message ?? 'Đặt giá thất bại, vui lòng thử lại');
    } finally {
      setBidLoading(false);
    }
  };

  // Main image
  const mainImage =
    product?.images?.find((img) => img.main || img.sortOrder === 0)?.url ||
    product?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  const allImages = product?.images?.map((img) => img.url).filter(Boolean) as string[] | undefined;

  if (loading) return <div className={styles.loading}>Đang tải thông tin đấu giá...</div>;

  if (error || !auction) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy phiên đấu giá</h2>
        <p>{error}</p>
        <Link to="/auctions">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/auctions" className={styles.backLink}>
        ← Quay lại danh sách
      </Link>

      {/* WS Notification toast */}
      {(latestMessage || notification?.content) && (
        <div
          style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '1rem',
            fontSize: '14px',
            color: '#856404',
          }}
        >
          🔔 {notification?.content ?? latestMessage}
        </div>
      )}

      <div className={styles.detailGrid}>
        {/* Left: Image Gallery */}
        <div className={styles.gallerySection}>
          <img
            src={mainImage}
            alt={auction.productName ?? 'Xe đấu giá'}
            className={styles.mainImage}
          />
          {allImages && allImages.length > 1 && (
            <div className={styles.thumbnailGrid}>
              {allImages.slice(0, 4).map((url, idx) => (
                <img key={idx} src={url} alt={`Ảnh ${idx + 1}`} className={styles.thumbnail} />
              ))}
            </div>
          )}

          {/* Vehicle Specs */}
          {product && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>Thông số kỹ thuật</h3>
              <ul className={styles.specsList}>
                {product.vinNumber && <li><strong>Số VIN:</strong> {product.vinNumber}</li>}
                {product.brand && <li><strong>Hãng:</strong> {product.brand}</li>}
                {product.model && <li><strong>Mẫu:</strong> {product.model}</li>}
                {product.categoryName && <li><strong>Danh mục:</strong> {product.categoryName}</li>}
                {product.status && <li><strong>Tình trạng:</strong> {product.status}</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Bidding Panel */}
        <div className={styles.biddingSection}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{auction.productName}</h1>
            <p className={styles.subtitle}>
              Trạng thái:{' '}
              <span style={{ fontWeight: 600 }}>{auction.status}</span>
              {isConnected && (
                <span style={{ color: '#22c55e', fontSize: '12px', marginLeft: '8px' }}>
                  ● LIVE
                </span>
              )}
            </p>
          </div>

          <div className={styles.bidBox}>
            {/* Countdown */}
            <div className={styles.timerRow}>
              <span className={styles.timerLabel}>Thời gian còn lại:</span>
              {isEnded ? (
                <span className={styles.endedText}>Đã kết thúc</span>
              ) : timeLeft ? (
                <span className={styles.timerValue}>
                  {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              ) : (
                <span className={styles.timerValue}>—</span>
              )}
            </div>

            {/* Current Price */}
            <div className={styles.priceRow}>
              <div>
                <p className={styles.priceLabel}>Giá hiện tại</p>
                <p className={styles.currentPrice}>{formatVND(displayPrice)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className={styles.bidsCount}>Giá khởi điểm</p>
                <p style={{ fontWeight: 600 }}>{formatVND(auction.startPrice)}</p>
              </div>
            </div>

            {/* Bid Increment Info */}
            {auction.bidIncrement && (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 8px' }}>
                Bước giá tối thiểu: <strong>{formatVND(auction.bidIncrement)}</strong>
                &nbsp;|&nbsp;
                Đặt cọc: <strong>{formatVND(auction.depositAmount)}</strong>
              </p>
            )}

            {/* Bid Form / Actions */}
            <div className={styles.actionRow}>
              {!isEnded && isAuthenticated ? (
                <div className={styles.bidForm}>
                  {bidSuccess && (
                    <div style={{ color: '#16a34a', fontWeight: 600, marginBottom: '6px' }}>
                      ✅ {bidSuccess}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="number"
                      placeholder={`Tối thiểu: ${formatVND(minNextBid)}`}
                      className={styles.bidInput}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minNextBid}
                    />
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handlePlaceBid}
                      disabled={bidLoading}
                      style={{ flex: 1, whiteSpace: 'nowrap' }}
                    >
                      {bidLoading ? 'Đang xử lý...' : 'Đặt giá'}
                    </Button>
                  </div>
                  {bidError && (
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{bidError}</p>
                  )}
                </div>
              ) : !isEnded && !isAuthenticated ? (
                <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                  <Button variant="outline" size="large" className={styles.fullWidthBtn}>
                    Đăng nhập để đặt giá
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="large" className={styles.fullWidthBtn} disabled>
                  Phiên đấu giá đã kết thúc
                </Button>
              )}
            </div>
          </div>

          {/* Auction metadata */}
          <div className={styles.sellerInfo}>
            <h3 className={styles.specsTitle}>Thông tin phiên đấu giá</h3>
            <ul className={styles.specsList} style={{ listStyle: 'none', padding: 0 }}>
              {auction.startTime && (
                <li><strong>Bắt đầu:</strong> {new Date(auction.startTime).toLocaleString('vi-VN')}</li>
              )}
              {auction.endTime && (
                <li><strong>Kết thúc:</strong> {new Date(auction.endTime).toLocaleString('vi-VN')}</li>
              )}
              {auction.winnerId && (
                <li><strong>Người thắng:</strong> {auction.winnerId}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
