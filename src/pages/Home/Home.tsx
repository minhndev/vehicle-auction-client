import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import { AuctionCard } from '../../features/bidding/components/AuctionCard/AuctionCard';
import { Button } from '../../components/ui/Button/Button';
import type { AuctionResponse } from '../../types/index';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await auctionApi.getPublicAuctions({ page: 0, size: 8, status: 'ACTIVE' });
        // If ACTIVE returns empty, fallback to any status
        const items = res.content ?? [];
        if (items.length === 0) {
          const fallback = await auctionApi.getPublicAuctions({ page: 0, size: 8 });
          setFeaturedAuctions(fallback.content ?? []);
        } else {
          setFeaturedAuctions(items);
        }
      } catch {
        // silent — show empty section, not error page
        setFeaturedAuctions([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className={styles.pageContainer}>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Tìm và Đấu giá Xe Mơ ước.</h1>
          <p className={styles.heroSubtitle}>
            Nền tảng đấu giá xe trực tuyến đáng tin cậy nhất. Kết nối với người bán uy tín và đặt giá an toàn.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/auctions">
              <Button variant="primary" size="large">Xem tất cả đấu giá</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="large">Đăng ký ngay</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Advanced Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Hãng xe</label>
          <select className={styles.filterInput}>
            <option value="">Tất cả hãng</option>
            <option value="toyota">Toyota</option>
            <option value="bmw">BMW</option>
            <option value="tesla">Tesla</option>
            <option value="mercedes">Mercedes</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Loại xe</label>
          <select className={styles.filterInput}>
            <option value="">Tất cả loại</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="truck">Truck</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Khoảng giá</label>
          <select className={styles.filterInput}>
            <option value="">Tất cả mức giá</option>
            <option value="under500m">Dưới 500 triệu</option>
            <option value="500m-1b">500 triệu - 1 tỷ</option>
            <option value="above1b">Trên 1 tỷ</option>
          </select>
        </div>
        <div>
          <Link to="/auctions">
            <Button variant="primary" style={{ width: '100%', height: '42px' }}>Tìm kiếm</Button>
          </Link>
        </div>
      </div>

      {/* Featured Live Auctions */}
      <section className={styles.section} style={{ paddingTop: '0' }}>
        <h2 className={styles.sectionTitle}>Đấu giá đang diễn ra</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            Đang tải...
          </div>
        ) : featuredAuctions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            Chưa có phiên đấu giá nào. <Link to="/auctions" style={{ color: 'var(--color-primary)' }}>Xem tất cả »</Link>
          </div>
        ) : (
          <>
            <div className={styles.auctionsGrid}>
              {featuredAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
              <Link to="/auctions">
                <Button variant="outline" size="large">Xem tất cả đấu giá</Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Categories Section */}
      <section className={styles.section} style={{ backgroundColor: '#f8fafc' }}>
        <h2 className={styles.sectionTitle}>Duyệt theo danh mục</h2>
        <div className={styles.categoriesGrid}>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🚙</div>
            <div className={styles.categoryName}>SUV</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>⚡</div>
            <div className={styles.categoryName}>Điện</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🛻</div>
            <div className={styles.categoryName}>Trucks</div>
          </div>
          <div className={styles.categoryCard}>
            <div className={styles.categoryIcon}>💎</div>
            <div className={styles.categoryName}>Luxury</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quy trình hoạt động</h2>
        <div className={styles.stepsContainer}>
          <div>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Đăng ký tài khoản</h3>
            <p className={styles.stepDesc}>Tạo tài khoản miễn phí và xác minh danh tính để tham gia đấu giá.</p>
          </div>
          <div>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Chọn xe yêu thích</h3>
            <p className={styles.stepDesc}>Duyệt hàng trăm xe đã được kiểm duyệt từ các người bán uy tín.</p>
          </div>
          <div>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Đặt giá và chiến thắng</h3>
            <p className={styles.stepDesc}>Tham gia đấu giá trực tiếp, đặt giá cao nhất và sở hữu chiếc xe mơ ước.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
