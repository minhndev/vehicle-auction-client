import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionApi, type AuctionQueryParams } from '../../features/bidding/api/auctionApi';
import { AuctionCard } from '../../features/bidding/components/AuctionCard/AuctionCard';
import { Button } from '../../components/ui/Button/Button';
import type { AuctionResponse } from '../../types/index';
import styles from './AuctionList.module.css';

const AUCTION_STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ACTIVE', label: 'Đang đấu giá' },
  { value: 'COMPLETED', label: 'Đã kết thúc' },
];

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'currentPrice,asc', label: 'Giá tăng dần' },
  { value: 'currentPrice,desc', label: 'Giá giảm dần' },
  { value: 'endTime,asc', label: 'Sắp kết thúc' },
];

const formatCompactVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, amount));
};

export const AuctionList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') ?? searchParams.get('year') ?? '');
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') ?? '');
  const [sortBy, setSortBy] = useState('createdAt,desc');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: AuctionQueryParams = {
        page: currentPage,
        size: 12,
        sort: sortBy,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      const response = await auctionApi.getPublicAuctions(params);
      setAuctions(response.content ?? []);
      setTotalPages(response.totalPages ?? 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải danh sách thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword, status, categoryId, minPrice, maxPrice, sortBy]);

  const syncSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params, { replace: true });
  }, [keyword, status, categoryId, minPrice, maxPrice, setSearchParams]);

  useEffect(() => {
    fetchAuctions(page);
  }, [page, fetchAuctions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    syncSearchParams();
    fetchAuctions(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilters = [keyword, status, categoryId, minPrice, maxPrice].filter((v) => `${v}`.trim()).length;
  const maxVisiblePages = 10;
  const startPage = Math.max(0, Math.min(page - Math.floor(maxVisiblePages / 2), Math.max(0, totalPages - maxVisiblePages)));
  const endPageExclusive = Math.min(totalPages, startPage + maxVisiblePages);
  const pageNumbers = Array.from({ length: Math.max(0, endPageExclusive - startPage) }, (_, idx) => startPage + idx);

  const stats = {
    active: auctions.filter((a) => a.status === 'ACTIVE').length,
    upcoming: auctions.filter((a) => a.status === 'UPCOMING').length,
    completed: auctions.filter((a) => a.status === 'COMPLETED').length,
    avgCurrentPrice:
      auctions.length > 0
        ? auctions.reduce((sum, auction) => sum + (auction.currentPrice ?? 0), 0) / auctions.length
        : 0,
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Sàn đấu giá xe trực tuyến</p>
          <h1 className={styles.title}>Danh sách đấu giá xe</h1>
          <p className={styles.subtitle}>
            Theo dõi các phiên đấu giá đang mở và lọc nhanh theo mức giá, trạng thái và từ khóa phương tiện.
          </p>
        </div>
        <div className={styles.statsPill}>
          <span className={styles.statsValue}>{loading ? '...' : auctions.length}</span>
          <span className={styles.statsLabel}>phiên trong trang hiện tại</span>
        </div>
      </section>

      <section className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <h2 className={styles.filterTitle}>Bộ lọc tìm kiếm</h2>
          <span className={styles.filterMeta}>{activeFilters} bộ lọc đang áp dụng</span>
        </div>

        <form className={styles.filterForm} onSubmit={handleSearch}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Từ khóa</span>
            <input
              type="text"
              placeholder="Tìm kiếm tên xe..."
              className={styles.input}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Trạng thái</span>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {AUCTION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Giá tối thiểu</span>
            <input
              type="number"
              placeholder="Giá tối thiểu (VNĐ)"
              className={styles.input}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Giá tối đa</span>
            <input
              type="number"
              placeholder="Giá tối đa (VNĐ)"
              className={styles.input}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" className={styles.submitBtn}>Tìm kiếm</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setKeyword('');
                setStatus('');
                setCategoryId('');
                setMinPrice('');
                setMaxPrice('');
                setSearchParams({}, { replace: true });
                setPage(0);
                fetchAuctions(0);
              }}
            >
              Xoá lọc
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.quickStats}>
        <article className={styles.quickStatCard}>
          <span>Đang đấu giá</span>
          <strong>{loading ? '...' : stats.active}</strong>
        </article>
        <article className={styles.quickStatCard}>
          <span>Sắp diễn ra</span>
          <strong>{loading ? '...' : stats.upcoming}</strong>
        </article>
        <article className={styles.quickStatCard}>
          <span>Đã kết thúc</span>
          <strong>{loading ? '...' : stats.completed}</strong>
        </article>
        <article className={styles.quickStatCard}>
          <span>Giá trung bình</span>
          <strong>{loading ? '...' : `${formatCompactVND(stats.avgCurrentPrice)} VND`}</strong>
        </article>
      </section>

      <section className={styles.resultsSection}>
        <div className={styles.resultHeader}>
          <div>
            <h2 className={styles.resultTitle}>Kết quả đấu giá</h2>
            {!loading && !error && (
              <p className={styles.resultMeta}>Hiển thị {auctions.length} phiên · Trang {page + 1} / {Math.max(totalPages, 1)}</p>
            )}
          </div>
          <div className={styles.resultControls}>
            <div className={styles.statusTabs}>
              {AUCTION_STATUSES.map((s) => (
                <button
                  key={s.value || 'ALL'}
                  type="button"
                  className={`${styles.tab} ${status === s.value ? styles.tabActive : ''}`}
                  onClick={() => {
                    setStatus(s.value);
                    setPage(0);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className={styles.sortWrap}>
              <span>Sắp xếp</span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải danh sách đấu giá...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : auctions.length === 0 ? (
          <div className={styles.empty}>Không tìm thấy phiên đấu giá phù hợp.</div>
        ) : (
          <>
            <div className={styles.grid}>
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className={styles.pageArrow}
                >
                  ←
                </Button>

                <div className={styles.pageNumbers}>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`${styles.pageNumberBtn} ${pageNumber === page ? styles.pageNumberActive : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={styles.pageArrow}
                >
                  →
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
