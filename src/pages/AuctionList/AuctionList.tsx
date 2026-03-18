import React, { useEffect, useState, useCallback } from 'react';
import { AuctionCard } from '../../features/bidding/components/AuctionCard/AuctionCard';
import { Button } from '../../components/ui/Button/Button';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { Auction } from '../../features/bidding/types';
import styles from './AuctionList.module.css';

export const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Giả sử API public/auctions có nhận thêm tham số categoryId, minPrice, maxPrice
      const response = await auctionApi.getPublicAuctions({
        page,
        size: 12,
      });
      // @ts-ignore
      if (response && response.content) {
         // @ts-ignore
        setAuctions(response.content);
        // @ts-ignore
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        setAuctions(response);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  }, [page, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // reset page on search
    fetchAuctions();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Live Auctions</h1>

      <div className={styles.topBar}>
        <form className={styles.filterForm} onSubmit={handleSearch}>
          <select 
            className={styles.select} 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="truck">Truck</option>
          </select>

          <input 
            type="number" 
            placeholder="Min Price" 
            className={styles.input}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <input 
            type="number" 
            placeholder="Max Price" 
            className={styles.input}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <Button type="submit" variant="primary">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading auctions...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : auctions.length === 0 ? (
        <div className={styles.empty}>No auctions found matching your criteria.</div>
      ) : (
        <>
          <div className={styles.grid}>
            {auctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
