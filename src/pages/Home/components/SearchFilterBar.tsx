import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuctionResponse } from '../../../types';
import { getAuctionList, getHomeCategories, getUpcomingAuctions } from './homeDataService';
import styles from '../Home.module.css';

interface CategoryOption {
  id: string;
  label: string;
}

interface PriceRangeOption {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

const formatCompactVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, amount));
};

const toNiceNumber = (value: number) => {
  if (value <= 0) return 0;
  const unit = 50_000_000;
  return Math.ceil(value / unit) * unit;
};

const buildPriceRangeOptions = (auctions: AuctionResponse[]): PriceRangeOption[] => {
  const prices = auctions
    .map((item) => Number(item.currentPrice ?? item.startPrice ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (prices.length < 4) {
    return [
      { id: 'all', label: 'Mọi mức giá' },
      { id: 'budget', label: `Dưới ${formatCompactVND(1_000_000_000)}`, max: 1_000_000_000 },
      { id: 'mid', label: `${formatCompactVND(1_000_000_000)} - ${formatCompactVND(2_000_000_000)}`, min: 1_000_000_000, max: 2_000_000_000 },
      { id: 'high', label: `Trên ${formatCompactVND(2_000_000_000)}`, min: 2_000_000_000 },
    ];
  }

  const q1 = toNiceNumber(prices[Math.floor((prices.length - 1) * 0.25)]);
  const q2 = toNiceNumber(prices[Math.floor((prices.length - 1) * 0.5)]);
  const q3 = toNiceNumber(prices[Math.floor((prices.length - 1) * 0.75)]);

  return [
    { id: 'all', label: 'Mọi mức giá' },
    { id: 'r1', label: `Dưới ${formatCompactVND(q1)}`, max: q1 },
    { id: 'r2', label: `${formatCompactVND(q1)} - ${formatCompactVND(q2)}`, min: q1, max: q2 },
    { id: 'r3', label: `${formatCompactVND(q2)} - ${formatCompactVND(q3)}`, min: q2, max: q3 },
    { id: 'r4', label: `Trên ${formatCompactVND(q3)}`, min: q3 },
  ];
};

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  emptyLabel: string;
}) => {
  return (
    <div className={styles.filterItem}>
      <span className={styles.filterLabel}>
        {label}
      </span>
      <div className={styles.filterValueRow}>
        <select className={styles.filterSelect} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{emptyLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className={styles.filterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export const SearchFilterBar: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRangeOption[]>([{ id: 'all', label: 'Mọi mức giá' }]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchFilterSources = async () => {
      try {
        const [categoriesRaw, activeAuctions, upcomingAuctions, completedAuctions] = await Promise.all([
          getHomeCategories(),
          getAuctionList({ status: 'ACTIVE', page: 0, size: 60, sort: 'currentPrice,desc' }),
          getUpcomingAuctions(60),
          getAuctionList({ status: 'COMPLETED', page: 0, size: 40, sort: 'updatedAt,desc' }),
        ]);

        if (!mounted) return;

        const categoryOptions = (Array.isArray(categoriesRaw) ? categoriesRaw : [])
          .map((item) => ({
            id: String(item.id ?? ''),
            label: item.name ?? 'Danh mục',
          }))
          .filter((item) => item.id);

        const allAuctions = [...activeAuctions, ...upcomingAuctions, ...completedAuctions];
        const yearCandidates = allAuctions
          .map((item) => Number((item.startTime ?? '').slice(0, 4)))
          .filter((year) => Number.isFinite(year) && year >= 2000 && year <= 2100);

        const uniqueYears = Array.from(new Set(yearCandidates)).sort((a, b) => b - a);

        setCategories(categoryOptions);
        setYears(uniqueYears);
        setPriceRanges(buildPriceRangeOptions(allAuctions));
      } catch {
        if (!mounted) return;
        setCategories([]);
        setYears([]);
        setPriceRanges([{ id: 'all', label: 'Mọi mức giá' }]);
      }
    };

    fetchFilterSources();
    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item.id, label: item.label })),
    [categories],
  );

  const yearOptions = useMemo(
    () => years.map((year) => ({ value: String(year), label: String(year) })),
    [years],
  );

  const priceOptions = useMemo(
    () => priceRanges.filter((item) => item.id !== 'all').map((item) => ({ value: item.id, label: item.label })),
    [priceRanges],
  );

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set('categoryId', selectedCategory);
    }

    if (selectedYear) {
      params.set('year', selectedYear);
    }

    const selectedPrice = priceRanges.find((item) => item.id === selectedPriceRangeId);
    if (selectedPrice?.min != null) {
      params.set('minPrice', String(selectedPrice.min));
    }
    if (selectedPrice?.max != null) {
      params.set('maxPrice', String(selectedPrice.max));
    }

    navigate(`/auctions${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className={`${styles.filterShell} bg-white/90 backdrop-blur-xl border border-white shadow-2xl shadow-[#2e3d83]/15 rounded-[24px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1 relative z-10 p-2 sm:p-4`}>
      <div className={styles.filterRow}>
        <FilterDropdown
          label="Danh mục"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
          emptyLabel="Tất cả danh mục"
        />
        <FilterDropdown
          label="Năm"
          value={selectedYear}
          onChange={setSelectedYear}
          options={yearOptions}
          emptyLabel="Mọi năm"
        />
        <FilterDropdown
          label="Khoảng giá"
          value={selectedPriceRangeId}
          onChange={setSelectedPriceRangeId}
          options={priceOptions}
          emptyLabel="Mọi mức giá"
        />
      </div>

      <button className={`${styles.filterCta} hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#2e3d83]/30 rounded-xl bg-gradient-to-r from-[#2e3d83] to-[#1e293b] border-0`} onClick={handleSearch}>
        <svg className={styles.filterIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className={`${styles.filterSearchText} font-bold tracking-wide`}>Tìm kiếm</span>
      </button>
    </div>
  );
};

