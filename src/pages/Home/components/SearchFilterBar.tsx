import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import type { AuctionResponse } from '../../../types';
import { getAuctionList, getHomeCategories, getUpcomingAuctions } from './homeDataService';

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
    <div className="flex-1 min-w-[140px] border-r border-slate-200/60 last:border-r-0 px-5 py-3 hover:bg-slate-50/50 transition-colors group cursor-pointer relative">
      <span className="block text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex justify-between items-center gap-2 relative">
        <select 
          className="flex-1 w-full bg-transparent border-none text-slate-900 text-base font-extrabold outline-none appearance-none cursor-pointer z-10" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" className="text-slate-500 font-medium">{emptyLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 font-medium">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="text-slate-400 group-hover:text-[#2e3d83] transition-colors absolute right-0 pointer-events-none" />
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
    <div className="w-[calc(100%-2rem)] max-w-5xl mx-auto bg-white/95 backdrop-blur-xl shadow-2xl shadow-[#2e3d83]/20 rounded-full border border-white/50 p-2.5 flex flex-col md:flex-row items-center gap-2 transform transition-all duration-300 hover:shadow-3xl">
      <div className="flex-1 w-full flex flex-col sm:flex-row rounded-3xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
        <FilterDropdown
          label="Dòng xe"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryOptions}
          emptyLabel="Tất cả hãng xe"
        />
        <FilterDropdown
          label="Năm sản xuất"
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

      <button 
        className="w-full md:w-[180px] h-[64px] rounded-full text-white bg-gradient-to-r from-[#2e3d83] to-[#1e293b] text-lg font-extrabold flex items-center justify-center gap-2.5 shadow-lg shadow-[#2e3d83]/30 hover:shadow-[#2e3d83]/50 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none shrink-0" 
        onClick={handleSearch}
      >
        <Search size={22} strokeWidth={3} />
        <span>Tìm Kiếm</span>
      </button>
    </div>
  );
};

