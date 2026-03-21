import React, { useEffect, useState, useCallback } from 'react';
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

export const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
        sort: 'createdAt,desc',
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;
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
  }, [keyword, status, minPrice, maxPrice]);

  useEffect(() => {
    fetchAuctions(page);
  }, [page, fetchAuctions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAuctions(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Danh sách đấu giá</h1>

      <div className={styles.topBar}>
        <form className={styles.filterForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm tên xe..."
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {AUCTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Giá tối thiểu (VNĐ)"
            className={styles.input}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Giá tối đa (VNĐ)"
            className={styles.input}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <Button type="submit" variant="primary">Tìm kiếm</Button>
        </form>
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
              >
                Trang trước
              </Button>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
