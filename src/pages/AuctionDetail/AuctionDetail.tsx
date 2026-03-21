import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { AuctionResponse, BidResponse, ProductResponse } from '../../types/index';
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

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const [recentBids, setRecentBids] = useState<BidResponse[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'activity'>('overview');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [auctionData, bidsData] = await Promise.all([
          auctionApi.getAuctionById(id),
          auctionApi.getAuctionBids(id).catch(() => [] as BidResponse[]),
        ]);

        setAuction(auctionData);
        setRecentBids(Array.isArray(bidsData) ? bidsData.slice(0, 8) : []);

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

  useEffect(() => {
    if (!latestMessage || !id) return;
    // Keep most recent feed item when websocket pushes an update.
    setRecentBids((prev) => prev.slice(0, 8));
  }, [latestMessage, id]);

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
      const createdBid = await auctionApi.placeBid(id!, { amount });
      setBidAmount('');
      setBidSuccess('Đặt giá thành công!');
      if (createdBid) {
        setRecentBids((prev) => [createdBid, ...prev].slice(0, 8));
      }
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

  useEffect(() => {
    if (mainImage) {
      setSelectedImage(mainImage);
    }
  }, [mainImage]);

  const statusToneClass =
    auction?.status === 'ACTIVE'
      ? styles.statusLive
      : auction?.status === 'SCHEDULED'
        ? styles.statusUpcoming
        : styles.statusEnded;

  const statusLabel =
    auction?.status === 'ACTIVE'
      ? 'Dang dau gia'
      : auction?.status === 'SCHEDULED'
        ? 'Sap mo ban'
        : 'Da ket thuc';

  if (loading) return <div className={styles.loading}>Đang tải thông tin đấu giá...</div>;

  if (error || !auction) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy phiên đấu giá</h2>
        <p>{error}</p>
        <Link to="/auctions">
          <Button variant="secondary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Link to="/auctions" className={styles.backLink}>
          ← Quay lại danh sách
        </Link>
        <div className={styles.liveState}>
          <span className={`${styles.dot} ${isConnected ? styles.dotOn : styles.dotOff}`} />
          {isConnected ? 'Cập nhật tự động' : 'Đang đồng bộ lại'}
        </div>
      </div>

      {(latestMessage || notification?.content) && (
        <div className={styles.toast}>
          🔔 {notification?.content ?? latestMessage}
        </div>
      )}

      <div className={styles.detailGrid}>
        <div className={styles.gallerySection}>
          <img
            src={selectedImage || mainImage}
            alt={auction.productName ?? 'Xe đấu giá'}
            className={styles.mainImage}
          />
          {allImages && allImages.length > 1 && (
            <div className={styles.thumbnailGrid}>
              {allImages.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.thumbnailButton} ${selectedImage === url ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImage(url)}
                >
                  <img src={url} alt={`Ảnh ${idx + 1}`} className={styles.thumbnail} />
                </button>
              ))}
            </div>
          )}

          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Tong quan
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Thong so
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Lich su gia
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>Tong quan phien dau gia</h3>
              <ul className={styles.specsList}>
                <li><strong>Gia khoi diem:</strong> {formatVND(auction.startPrice)}</li>
                <li><strong>Gia hien tai:</strong> {formatVND(displayPrice)}</li>
                <li><strong>Buoc gia:</strong> {formatVND(auction.bidIncrement)}</li>
                <li><strong>Tien coc:</strong> {formatVND(auction.depositAmount)}</li>
                {auction.startTime && <li><strong>Bat dau:</strong> {formatDateTime(auction.startTime)}</li>}
                {auction.endTime && <li><strong>Ket thuc:</strong> {formatDateTime(auction.endTime)}</li>}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && product && (
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

          {activeTab === 'activity' && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>Lich su dau gia gan day</h3>
              {recentBids.length === 0 ? (
                <p className={styles.activityEmpty}>Chua co luot tra gia nao.</p>
              ) : (
                <ul className={styles.activityList}>
                  {recentBids.map((bid) => (
                    <li key={bid.id ?? `${bid.bidderId}-${bid.createdAt}`} className={styles.activityItem}>
                      <div>
                        <p className={styles.activityPrice}>{formatVND(bid.amount)}</p>
                        <p className={styles.activityMeta}>Nguoi dat: {bid.bidderId?.slice(0, 8) ?? 'An danh'}</p>
                      </div>
                      <span className={styles.activityTime}>{formatDateTime(bid.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={styles.biddingSection}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{auction.productName}</h1>
            <p className={styles.subtitle}>Thong tin phien dau gia cap nhat theo thoi gian thuc.</p>
            <span className={`${styles.statusBadge} ${statusToneClass}`}>{statusLabel}</span>
            <div className={styles.summaryChips}>
              <span className={styles.chip}>Mã phiên: {String(auction.id).slice(0, 8)}</span>
              <span className={styles.chip}>Bước giá: {formatVND(auction.bidIncrement)}</span>
              <span className={styles.chip}>Cọc: {formatVND(auction.depositAmount)}</span>
            </div>
          </div>

          <div className={styles.bidBox}>
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

            <div className={styles.priceRow}>
              <div>
                <p className={styles.priceLabel}>Giá hiện tại</p>
                <p className={styles.currentPrice}>{formatVND(displayPrice)}</p>
              </div>
              <div className={styles.priceMetaBlock}>
                <p className={styles.bidsCount}>Giá khởi điểm</p>
                <p className={styles.startPrice}>{formatVND(auction.startPrice)}</p>
              </div>
            </div>

            {auction.bidIncrement && (
              <p className={styles.metaLine}>
                Bước giá tối thiểu: <strong>{formatVND(auction.bidIncrement)}</strong>
                &nbsp;|&nbsp;
                Đặt cọc: <strong>{formatVND(auction.depositAmount)}</strong>
              </p>
            )}

            <div className={styles.actionRow}>
              {!isEnded && isAuthenticated ? (
                <div className={styles.bidForm}>
                  {bidSuccess && (
                    <div className={styles.successText}>
                      ✅ {bidSuccess}
                    </div>
                  )}
                  <div className={styles.bidRow}>
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
                      size="lg"
                      onClick={handlePlaceBid}
                      disabled={bidLoading}
                      className={styles.bidCta}
                    >
                      {bidLoading ? 'Đang xử lý...' : 'Đặt giá'}
                    </Button>
                  </div>
                  {bidError && (
                    <p className={styles.errorText}>{bidError}</p>
                  )}
                </div>
              ) : !isEnded && !isAuthenticated ? (
                <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                  <Button variant="secondary" size="lg" className={styles.fullWidthBtn}>
                    Đăng nhập để đặt giá
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="lg" className={styles.fullWidthBtn} disabled>
                  Phiên đấu giá đã kết thúc
                </Button>
              )}
            </div>
          </div>

          <div className={styles.sellerInfo}>
            <h3 className={styles.specsTitle}>Thông tin phiên đấu giá</h3>
            <ul className={styles.metaList}>
              {auction.startTime && (
                <li><strong>Bắt đầu:</strong> {new Date(auction.startTime).toLocaleString('vi-VN')}</li>
              )}
              {auction.endTime && (
                <li><strong>Kết thúc:</strong> {new Date(auction.endTime).toLocaleString('vi-VN')}</li>
              )}
              {auction.winnerId && (
                <li><strong>Người thắng:</strong> {auction.winnerId}</li>
              )}
              {auction.createdBy && (
                <li><strong>Khởi tạo bởi:</strong> {auction.createdBy}</li>
              )}
            </ul>
          </div>

          <div className={styles.sellerInfo}>
            <div className={styles.activityHeader}>
              <h3 className={styles.specsTitle}>Hoạt động đấu giá</h3>
              <span className={styles.activityCount}>{recentBids.length} lượt gần nhất</span>
            </div>
            {recentBids.length === 0 ? (
              <p className={styles.activityEmpty}>Chưa có lượt trả giá nào.</p>
            ) : (
              <ul className={styles.activityList}>
                {recentBids.map((bid) => (
                  <li key={bid.id ?? `${bid.bidderId}-${bid.createdAt}`} className={styles.activityItem}>
                    <div>
                      <p className={styles.activityPrice}>{formatVND(bid.amount)}</p>
                      <p className={styles.activityMeta}>
                        Người đặt: {bid.bidderId?.slice(0, 8) ?? 'Ẩn danh'}
                      </p>
                    </div>
                    <span className={styles.activityTime}>{formatDateTime(bid.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
