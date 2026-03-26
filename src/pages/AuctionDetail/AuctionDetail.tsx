import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { CalendarDays, Settings2, Droplets, Gauge, AlertCircle, Clock, Trophy, CheckCircle2, MapPin, ImageIcon, ArrowLeft, Send, X, ChevronUp, ChevronDown, Heart } from 'lucide-react';
import { catalogApi } from '../../api/catalogApi';
import { paymentApi } from '../../api/paymentApi';
import { userApi } from '../../api/userApi';
import { watchlistApi } from '../../api/watchlistApi';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { AuctionResponse, BidResponse, ProductResponse } from '../../types/index';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { usePageI18n } from '../../i18n/usePageI18n';
import styles from './AuctionDetail.module.css';

const DEPOSIT_PENDING_AUCTION_ID_KEY = 'deposit.pendingAuctionId';
const DEPOSIT_PAID_AUCTION_KEY_PREFIX = 'deposit.paidAuctionId.';
const LIVE_APPEND_BIDS_LIMIT = 20;
const RANKING_VISIBLE_ROWS = 7;

const PAID_STATUSES = new Set(['SUCCESS', 'PAID']);
const FAILED_STATUSES = new Set(['FAILED', 'CANCELLED', 'CANCELED', 'EXPIRED']);
const DEPOSIT_EVENT_TYPE = 'DEPOSIT_PAYMENT_UPDATED';

const normalize = (value: unknown): string => String(value ?? '').trim().toLowerCase();

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

const formatMileage = (value?: number) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toLocaleString('vi-VN')} km`;
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value == null || typeof value === 'object') continue;
    const str = String(value).trim();
    if (str) return str;
  }
  return undefined;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = toNumberOrUndefined(source[key]);
    if (value != null) return value;
  }
  return undefined;
};

const deriveVehicleFromName = (name?: string): { brand?: string; model?: string; manufactureYear?: number } => {
  const normalized = String(name ?? '').trim();
  if (!normalized) return {};

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};

  const yearCandidate = parts[parts.length - 1];
  const yearNumber = /^\d{4}$/.test(yearCandidate) ? Number(yearCandidate) : undefined;
  const brand = parts[0];
  const modelParts = yearNumber != null ? parts.slice(1, -1) : parts.slice(1);
  const model = modelParts.length > 0 ? modelParts.join(' ') : undefined;

  return {
    brand,
    model,
    manufactureYear: yearNumber,
  };
};

const buildProductFromUnknown = (source: unknown): ProductResponse | null => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  const raw = source as Record<string, unknown>;
  const id = pickString(raw, ['id', 'productId', 'product_id']);
  const name = pickString(raw, ['name', 'productName', 'title', 'product_name']);
  const brand = pickString(raw, ['brand', 'vehicleBrand', 'make', 'vehicle_brand']);
  const model = pickString(raw, ['model', 'vehicleModel', 'vehicle_model']);
  const vinNumber = pickString(raw, ['vinNumber', 'vin', 'chassisNumber', 'vin_number', 'chassis_number']);
  const color = pickString(raw, ['color', 'vehicleColor', 'vehicle_color']);
  const engineNumber = pickString(raw, ['engineNumber', 'engineNo', 'engine_number']);
  const licensePlate = pickString(raw, ['licensePlate', 'plateNumber', 'license_plate', 'plate_number']);
  const transmission = pickString(raw, ['transmission', 'gearbox']);
  const fuelType = pickString(raw, ['fuelType', 'fuel', 'fuel_type']);
  const description = pickString(raw, ['description', 'specification']);
  const manufactureYear = pickNumber(raw, ['manufactureYear', 'year', 'modelYear', 'manufacture_year', 'model_year']);
  const mileage = pickNumber(raw, ['mileage', 'odometer']);
  const basePrice = pickNumber(raw, ['basePrice', 'reservePrice', 'listPrice', 'base_price', 'reserve_price']);
  const startPrice = pickNumber(raw, ['startPrice', 'start_price']);
  const status = pickString(raw, ['status', 'productStatus', 'product_status']);
  const categoryId = pickString(raw, ['categoryId', 'category_id']);
  const categoryName = pickString(raw, ['categoryName', 'category', 'category_name']);

  const hasAnyProductField = [
    id,
    name,
    brand,
    model,
    vinNumber,
    engineNumber,
    licensePlate,
    transmission,
    fuelType,
    mileage,
    manufactureYear,
  ].some((v) => v != null && String(v).trim().length > 0);

  if (!hasAnyProductField) {
    return null;
  }

  return {
    id,
    name,
    brand,
    model,
    vinNumber,
    color,
    engineNumber,
    licensePlate,
    transmission,
    fuelType,
    description,
    manufactureYear,
    mileage,
    basePrice,
    startPrice,
    status,
    categoryId,
    categoryName,
    images: Array.isArray(raw.images) ? (raw.images as ProductResponse['images']) : undefined,
  };
};

const mergeProduct = (base: ProductResponse | null, next: ProductResponse | null): ProductResponse | null => {
  if (!base && !next) return null;
  if (!base) return next;
  if (!next) return base;
  return {
    ...base,
    ...next,
    images: next.images && next.images.length > 0 ? next.images : base.images,
  };
};

const productCompletenessScore = (value: ProductResponse | null): number => {
  if (!value) return 0;
  let score = 0;
  if (value.name) score += 1;
  if (value.brand) score += 1;
  if (value.model) score += 1;
  if (value.vinNumber) score += 2;
  if (value.engineNumber) score += 2;
  if (value.licensePlate) score += 2;
  if (value.transmission) score += 1;
  if (value.fuelType) score += 1;
  if (value.mileage != null) score += 1;
  if (value.manufactureYear != null || value.year != null) score += 1;
  if (value.color) score += 1;
  if (value.description) score += 1;
  return score;
};

const extractBestProductFromPayload = (payload: unknown): ProductResponse | null => {
  const visited = new Set<unknown>();
  const stack: unknown[] = [payload];
  let best: ProductResponse | null = null;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;
    if (visited.has(current)) continue;
    visited.add(current);

    const candidate = buildProductFromUnknown(current);
    if (productCompletenessScore(candidate) > productCompletenessScore(best)) {
      best = candidate;
    }

    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }

    for (const value of Object.values(current as Record<string, unknown>)) {
      if (value && typeof value === 'object') {
        stack.push(value);
      }
    }
  }

  return best;
};

const hasCoreSpecs = (value: ProductResponse | null): boolean => {
  if (!value) return false;
  const present = [
    value.vinNumber,
    value.engineNumber,
    value.licensePlate,
    value.transmission,
    value.fuelType,
    value.mileage,
    value.color,
    value.description,
  ].filter((v) => v != null && String(v).trim().length > 0).length;
  return present >= 3;
};

const resolveAuctionProductId = (source: unknown): string | undefined => {
  if (!source || typeof source !== 'object') return undefined;
  const raw = source as Record<string, unknown>;

  const keys = ['productId', 'productID', 'product_id', 'vehicleId', 'vehicleID', 'vehicle_id', 'product'];
  for (const k of keys) {
    const val = raw[k];
    if (val == null) continue;
    if (typeof val === 'string' || typeof val === 'number') {
      const str = String(val).trim();
      if (str) return str;
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      const innerId = obj.id ?? obj.productId ?? obj.productID ?? obj.product_id;
      if (innerId != null && (typeof innerId === 'string' || typeof innerId === 'number')) {
        const str = String(innerId).trim();
        if (str) return str;
      }
    }
  }

  return undefined;
};

const resolveAuctionProductName = (source: unknown): string | undefined => {
  if (!source || typeof source !== 'object') return undefined;
  const raw = source as Record<string, unknown>;

  const keys = ['productName', 'product_name', 'vehicleName', 'vehicle_name', 'name', 'title', 'product'];
  for (const k of keys) {
    const val = raw[k];
    if (val == null) continue;
    if (typeof val === 'string' || typeof val === 'number') {
      const str = String(val).trim();
      if (str) return str;
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      const innerName = obj.name ?? obj.productName ?? obj.title;
      if (innerName != null && (typeof innerName === 'string' || typeof innerName === 'number')) {
        const str = String(innerName).trim();
        if (str) return str;
      }
    }
  }

  return undefined;
};

const getBidIdentity = (bid: BidResponse): string => {
  return String(bid.id ?? bid.bidId ?? `${bid.bidderId ?? bid.bidderMask ?? 'bidder'}-${bid.createdAt ?? ''}-${bid.amount ?? 0}`);
};

const trimBids = (items: BidResponse[], limit = LIVE_APPEND_BIDS_LIMIT): BidResponse[] => {
  return items.slice(0, limit);
};

const sortBidsByRank = (items: BidResponse[]): BidResponse[] => {
  if (!items || !Array.isArray(items) || items.length === 0) return [];

  // Group by bidderId, keeping the highest bid for each user
  const highestBidMap = new Map<string, BidResponse>();

  for (const bid of items) {
    // Priority: bidderId (numeric or UUID) > bidderMask (e.g. BIDDER-F3027C) > fallback identity
    const key = (bid.bidderId ? String(bid.bidderId) : bid.bidderMask) || getBidIdentity(bid);
    const existing = highestBidMap.get(key);
    
    if (!existing) {
      highestBidMap.set(key, bid);
    } else {
      const currentAmount = Number(bid.amount ?? 0);
      const existingAmount = Number(existing.amount ?? 0);
      
      if (currentAmount > existingAmount) {
        highestBidMap.set(key, bid);
      } else if (currentAmount === existingAmount) {
        // Tie breaker for same amount: earlier time wins
        const currentTime = new Date(bid.createdAt ?? 0).getTime();
        const existingTime = new Date(existing.createdAt ?? 0).getTime();
        if (currentTime < existingTime) {
           highestBidMap.set(key, bid);
        }
      }
    }
  }

  // Sort the unique highest bids
  return Array.from(highestBidMap.values()).sort((a, b) => {
    const rankA = Number(a.rank);
    const rankB = Number(b.rank);
    const hasRankA = Number.isFinite(rankA) && rankA > 0;
    const hasRankB = Number.isFinite(rankB) && rankB > 0;

    if (hasRankA && hasRankB && rankA !== rankB) {
      return rankA - rankB;
    }

    if (hasRankA && !hasRankB) return -1;
    if (!hasRankA && hasRankB) return 1;

    const amountA = Number(a.amount ?? 0);
    const amountB = Number(b.amount ?? 0);
    if (amountA !== amountB) {
      return amountB - amountA; // Descending amount
    }

    const timeA = new Date(a.createdAt ?? 0).getTime();
    const timeB = new Date(b.createdAt ?? 0).getTime();
    return timeA - timeB; // Ascending time (earlier is better for auction)
  });
};

const getDisplayRank = (bid: BidResponse, index: number): number => {
  const rank = Number(bid.rank);
  if (Number.isFinite(rank) && rank > 0) {
    return rank;
  }
  return index + 1;
};

// Removed getRankBadgeClass as it used old CSS modules

const CountdownDisplay: React.FC<{
  startTime?: string | null;
  endTime?: string | null;
  actualEndTime?: string | null;
  auctionHasStarted: boolean;
  isEnded: boolean;
  extensionBadgeMinutes: number;
}> = ({ startTime, endTime, actualEndTime, auctionHasStarted, isEnded, extensionBadgeMinutes }) => {
  const startCountdown = useCountdown(startTime || '');
  const endCountdown = useCountdown(actualEndTime || endTime || '');

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Thời Gian Bắt Đầu</span>
        <span className="font-mono text-lg font-bold">{auctionHasStarted ? 'Đã bắt đầu' : (startCountdown ? `${startCountdown.hours}h ${startCountdown.minutes}m ${startCountdown.seconds}s` : '--')}</span>
      </div>
      <div className="flex flex-col border-l border-white/10 pl-4 relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#f4c23d] uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Kết Thúc</span>
          {extensionBadgeMinutes > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm animate-pulse">+{extensionBadgeMinutes}m HT</span>}
        </div>
        <span className="font-mono text-xl font-black text-white">{isEnded ? 'Đã kết thúc' : (endCountdown ? `${endCountdown.hours}h ${endCountdown.minutes}m ${endCountdown.seconds}s` : '--')}</span>
      </div>
    </div>
  );
};

export const AuctionDetail: React.FC = () => {
  const { tp } = usePageI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);

  const [selectedBidStep, setSelectedBidStep] = useState(1);
  const [bidError, setBidError] = useState('');
  const [bidSuccessPopup, setBidSuccessPopup] = useState('');
  const [extensionPopup, setExtensionPopup] = useState('');
  const [baseEndTimeMs, setBaseEndTimeMs] = useState<number | null>(null);
  const [extensionBadgeMinutes, setExtensionBadgeMinutes] = useState(0);
  const [bidLoading, setBidLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [isDepositVerified, setIsDepositVerified] = useState(false);
  const [checkingDeposit, setCheckingDeposit] = useState(false);
  const [recentBids, setRecentBids] = useState<BidResponse[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'auction'>('overview');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showOutbidBanner, setShowOutbidBanner] = useState(false);
  const hasAnnouncedWinnerRef = useRef(false);
  const bidsFailCountRef = useRef(0);
  const bidsCooldownUntilRef = useRef(0);

  // Use a real state so component re-renders every second to check if time is up
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const toggleWatchlist = async () => {
    if (!id || !isAuthenticated) {
      navigate('/login');
      return;
    }
    const productId = auction?.productId || product?.id;
    if (!productId) return;

    setWatchlistLoading(true);
    try {
      if (isWatchlisted) {
        await watchlistApi.removeFromWatchlist(productId);
        setIsWatchlisted(false);
      } else {
        await watchlistApi.addToWatchlist(productId);
        setIsWatchlisted(true);
      }
    } catch {
      // ignore
    } finally {
      setWatchlistLoading(false);
    }
  };

  const fetchBidsWithBackoff = useCallback(async (auctionId: string): Promise<BidResponse[]> => {
    const now = Date.now();
    if (now < bidsCooldownUntilRef.current) {
      return [];
    }

    try {
      const bids = await auctionApi.getAuctionBids(auctionId);
      bidsFailCountRef.current = 0;
      return bids;
    } catch (error: unknown) {
      const axiosErr = error as { response?: { status?: number } };
      const statusCode = axiosErr.response?.status;

      if (statusCode && statusCode >= 500) {
        bidsFailCountRef.current += 1;
        if (bidsFailCountRef.current >= 2) {
          bidsCooldownUntilRef.current = now + 30000;
        }
      }

      return [];
    }
  }, []);

  const refreshAuctionRealtime = useCallback(async (auctionId: string) => {
    try {
      const [nextAuction, latestBids] = await Promise.all([
        auctionApi.getAuctionById(auctionId),
        fetchBidsWithBackoff(auctionId),
      ]);
      setAuction((prevAuction) => {
        if (prevAuction?.endTime && nextAuction?.endTime) {
          const prevEnd = new Date(prevAuction.endTime).getTime();
          const nextEnd = new Date(nextAuction.endTime).getTime();
          if (Number.isFinite(prevEnd) && Number.isFinite(nextEnd) && nextEnd > prevEnd) {
            const extendedMinutes = Math.round((nextEnd - prevEnd) / 60000);
            if (extendedMinutes > 0) {
              setExtensionPopup(tp('auctionDetail.extendedMinutes', { minutes: extendedMinutes }));
            }
          }
        }

        return nextAuction;
      });

      const ranked = Array.isArray(latestBids) ? sortBidsByRank(latestBids) : [];
      setRecentBids(trimBids(ranked));
    } catch {
      // Ignore transient refresh failures; next WS event/poll will re-sync.
    }
  }, [fetchBidsWithBackoff]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const findProductByIdAcrossPages = async (targetId: string): Promise<ProductResponse | null> => {
        const normalizedId = normalize(targetId);
        if (!normalizedId) return null;

        const maxPages = 8;
        for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
          const response = await catalogApi.getProducts({
            page: pageIndex,
            size: 50,
            sort: 'createdAt,desc',
          });
          const list = response.content ?? [];
          const matched = list.find((item) => normalize(item.id) === normalizedId);
          if (matched) {
            return matched;
          }

          const last = response.last === true;
          const totalPages = Number(response.totalPages ?? 0);
          if (last || (Number.isFinite(totalPages) && pageIndex + 1 >= totalPages)) {
            break;
          }
        }

        return null;
      };

      const findProductByNameAcrossPages = async (targetName: string): Promise<ProductResponse | null> => {
        const normalizedName = normalize(targetName);
        if (!normalizedName) return null;

        try {
          const searchResponse = await catalogApi.getProducts({
            keyword: targetName,
            page: 0,
            size: 50,
          });
          const searchList = searchResponse.content ?? [];
          const exact = searchList.find((item) => normalize(item.name) === normalizedName);
          if (exact) return exact;
          if (searchList.length > 0) return searchList[0];
        } catch {
          // Continue to broad paging fallback.
        }

        const maxPages = 6;
        for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
          const response = await catalogApi.getProducts({
            page: pageIndex,
            size: 50,
            sort: 'createdAt,desc',
          });
          const list = response.content ?? [];
          const exact = list.find((item) => normalize(item.name) === normalizedName);
          if (exact) return exact;
          const partial = list.find((item) => normalize(item.name).includes(normalizedName) || normalizedName.includes(normalize(item.name)));
          if (partial) return partial;

          const last = response.last === true;
          const totalPages = Number(response.totalPages ?? 0);
          if (last || (Number.isFinite(totalPages) && pageIndex + 1 >= totalPages)) {
            break;
          }
        }

        return null;
      };

      try {
        setLoading(true);
        const [auctionData, bidsData] = await Promise.all([
          auctionApi.getAuctionById(id),
          fetchBidsWithBackoff(id),
        ]);

        setAuction(auctionData);
        setRecentBids(Array.isArray(bidsData) ? trimBids(sortBidsByRank(bidsData)) : []);

        const auctionProductId = resolveAuctionProductId(auctionData) || (typeof auctionData.productId === 'string' ? auctionData.productId : undefined);
        const auctionProductName = resolveAuctionProductName(auctionData) || (typeof auctionData.productName === 'string' ? auctionData.productName : undefined);

        let resolvedProduct = extractBestProductFromPayload(auctionData);

        // Fetch product details directly by productId first.
        if (auctionProductId) {
          try {
            const productData = await catalogApi.getProductById(auctionProductId);
            resolvedProduct = mergeProduct(resolvedProduct, extractBestProductFromPayload(productData) || (productData as ProductResponse));
          } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number, data?: any } };
            if (axiosErr.response?.status === 403) setProductFetchError('Lỗi 403: Không có quyền truy cập dữ liệu xe.');
            else if (axiosErr.response?.status === 404) setProductFetchError('Lỗi 404: Không tìm thấy dữ liệu xe.');
            else setProductFetchError('Lỗi kết nối khi tải dữ liệu xe.');
          }
        }

        // Product list paging fallback by productId.
        if ((!resolvedProduct || !hasCoreSpecs(resolvedProduct)) && auctionProductId) {
          try {
            const byIdCandidate = await findProductByIdAcrossPages(auctionProductId);
            resolvedProduct = mergeProduct(resolvedProduct, extractBestProductFromPayload(byIdCandidate) || byIdCandidate);
          } catch {
            // Continue with next fallback.
          }
        }

        // Product list fallback by productName.
        if ((!resolvedProduct || !hasCoreSpecs(resolvedProduct)) && auctionProductName) {
          try {
            const byNameCandidate = await findProductByNameAcrossPages(auctionProductName);
            resolvedProduct = mergeProduct(resolvedProduct, extractBestProductFromPayload(byNameCandidate) || byNameCandidate);
          } catch {
            // Product details optional — don't fail the page.
          }
        }

        if (resolvedProduct) {
          setProduct(resolvedProduct);
        } else {
          // Keep previous behavior deterministic if nothing could be resolved.
          setProduct(null);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : tp('auctionDetail.loadFailed');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchBidsWithBackoff, id]);

  const { currentPrice: wsPrice, latestMessage, notification, outbidNotification, depositStatusMessage, isConnected } = useAuctionWebSocket(id ?? '');

  useEffect(() => {
    if (!id || !depositStatusMessage) {
      return;
    }

    if (depositStatusMessage.type && depositStatusMessage.type !== DEPOSIT_EVENT_TYPE) {
      return;
    }

    const msgAuctionId = normalize(depositStatusMessage.auctionId);
    const currentAuctionId = normalize(id);
    if (!msgAuctionId || msgAuctionId !== currentAuctionId) {
      return;
    }

    const paidFlagKey = `${DEPOSIT_PAID_AUCTION_KEY_PREFIX}${id}`;
    const paymentStatus = String(depositStatusMessage.paymentStatus ?? '').trim().toUpperCase();
    const depositStatus = String(depositStatusMessage.depositStatus ?? '').trim().toUpperCase();

    const isPaidEvent =
      PAID_STATUSES.has(paymentStatus)
      || PAID_STATUSES.has(depositStatus)
      || (paymentStatus === 'SUCCESS' && depositStatus === 'PAID');

    if (isPaidEvent) {
      sessionStorage.setItem(paidFlagKey, '1');
      setIsDepositVerified(true);
      setCheckingDeposit(false);
      setDepositError('');
      return;
    }

    if (FAILED_STATUSES.has(paymentStatus) || FAILED_STATUSES.has(depositStatus)) {
      sessionStorage.removeItem(paidFlagKey);
      setIsDepositVerified(false);
      setCheckingDeposit(false);
    }
  }, [depositStatusMessage, id]);

  useEffect(() => {
    if (!id) return;
    if (wsPrice == null && !latestMessage) return;

    const timer = window.setTimeout(() => {
      refreshAuctionRealtime(id);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [id, latestMessage, refreshAuctionRealtime, wsPrice]);

  // Prefer real-time WS price over initial API price
  const displayPrice = wsPrice ?? auction?.currentPrice ?? auction?.startPrice ?? 0;
  const minNextBid = displayPrice + (auction?.bidIncrement ?? 0);
  const bidStepValue = auction?.bidIncrement ?? 0;
  const stepOptions = [1, 2, 3, 5];
  const selectedBidAmount = bidStepValue > 0
    ? displayPrice + (bidStepValue * selectedBidStep)
    : minNextBid;

  // isEnded — computed from live clock (nowMs), not useMemo
  const isEnded = (() => {
    const status = auction?.status?.toUpperCase() || '';
    if (['COMPLETED', 'CANCELLED', 'FAILED', 'ENDED', 'FINISHED'].includes(status)) return true;
    const targetTime = new Date(auction?.actualEndTime || auction?.endTime || 0).getTime();
    return targetTime > 0 && targetTime <= nowMs;
  })();

  // Auto-refresh when auction ends locally but API hasn't caught up yet
  // Keep polling every 3s (up to 10 times) until status flips to COMPLETED
  const winnerPollCountRef = useRef(0);
  useEffect(() => {
    if (!isEnded || !id) return;
    if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(auction?.status ?? '')) return;
    // Auction ended locally but status still ACTIVE — start polling
    winnerPollCountRef.current = 0;
    const poll = setInterval(async () => {
      winnerPollCountRef.current += 1;
      await refreshAuctionRealtime(id);
      if (winnerPollCountRef.current >= 10) clearInterval(poll);
    }, 3000);
    return () => clearInterval(poll);
  }, [isEnded, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Winner modal via API status (after refresh)
  useEffect(() => {
    const winnerId = String(auction?.winnerId ?? '').trim();
    const userId = String(currentUserId ?? '').trim();
    if (!winnerId || !userId) return;
    if (isEnded && auction?.status === 'COMPLETED' && winnerId === userId && !hasAnnouncedWinnerRef.current) {
      setShowWinnerModal(true);
      hasAnnouncedWinnerRef.current = true;
    }
  }, [isEnded, auction?.status, auction?.winnerId, currentUserId]);

  // Winner modal via WS notification push (AUCTION_WON type from BE)
  useEffect(() => {
    if (!notification || !notification.type) return;
    const notifType = String(notification.type).toUpperCase();
    // BE sends type = AUCTION_WON  (not 'WIN' or 'WINNER')
    const isWinNotif = notifType === 'AUCTION_WON' || notifType.includes('WON') || notifType.includes('WIN');
    if (isWinNotif && !hasAnnouncedWinnerRef.current) {
      setShowWinnerModal(true);
      hasAnnouncedWinnerRef.current = true;
    }
  }, [notification]);

  // Auto-refresh when auction starts (UPCOMING -> ACTIVE transition)
  const hasRefreshedOnStartRef = useRef(false);
  useEffect(() => {
    if (!id || !auction?.startTime || auction.status !== 'UPCOMING') return;
    
    const startTimeMs = new Date(auction.startTime).getTime();
    if (nowMs >= startTimeMs && !hasRefreshedOnStartRef.current) {
      hasRefreshedOnStartRef.current = true;
      console.log('Auction start time reached, refreshing status...');
      refreshAuctionRealtime(id);
    } else if (nowMs < startTimeMs) {
      // Reset ref if we are before start (in case of time sync/updates)
      hasRefreshedOnStartRef.current = false;
    }
  }, [id, auction?.startTime, auction?.status, nowMs, refreshAuctionRealtime]);

  // Outbid banner
  useEffect(() => {
    if (!outbidNotification) return;
    setShowOutbidBanner(true);
    const t = window.setTimeout(() => setShowOutbidBanner(false), 6000);
    return () => window.clearTimeout(t);
  }, [outbidNotification]);

  useEffect(() => {
    setSelectedBidStep(1);
  }, [displayPrice, bidStepValue]);

  useEffect(() => {
    if (!bidSuccessPopup) {
      return;
    }

    const timer = window.setTimeout(() => {
      setBidSuccessPopup('');
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bidSuccessPopup]);

  useEffect(() => {
    if (!extensionPopup) {
      return;
    }

    const timer = window.setTimeout(() => {
      setExtensionPopup('');
    }, 4200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [extensionPopup]);

  useEffect(() => {
    if (!auction?.endTime) {
      return;
    }

    const currentEnd = new Date(auction.endTime).getTime();
    if (!Number.isFinite(currentEnd)) {
      return;
    }

    if (baseEndTimeMs == null) {
      setBaseEndTimeMs(currentEnd);
      return;
    }

    const diffMinutes = Math.round((currentEnd - baseEndTimeMs) / 60000);
    setExtensionBadgeMinutes(diffMinutes > 0 ? diffMinutes : 0);
  }, [auction?.endTime, baseEndTimeMs]);

  const checkDepositStatus = useCallback((silent = false) => {
    if (!id || !isAuthenticated || isEnded) {
      setIsDepositVerified(false);
      setCheckingDeposit(false);
      return;
    }

    const paidFlagKey = `${DEPOSIT_PAID_AUCTION_KEY_PREFIX}${id}`;
    const localPaidFlag = sessionStorage.getItem(paidFlagKey) === '1';

    if (!silent) {
      setCheckingDeposit(true);
      setDepositError('');
    }

    // Backend may not expose GET /deposits list; keep status from session flags + WS updates.
    setIsDepositVerified(localPaidFlag);

    if (!silent) {
      setCheckingDeposit(false);
    }
  }, [id, isAuthenticated, isEnded]);

  useEffect(() => {
    checkDepositStatus(false);

    const handleFocus = () => {
      checkDepositStatus(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDepositStatus(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkDepositStatus]);

  const handlePlaceBid = async () => {
    setBidError('');
    setBidSuccessPopup('');
    const amount = Number(selectedBidAmount);

    if (!amount || isNaN(amount)) {
      setBidError(tp('validation.validAmount', { ns: 'validation', defaultValue: 'Vui lòng nhập số tiền hợp lệ' }));
      return;
    }
    if (amount < minNextBid) {
      setBidError(tp('errors.bid.minAmount', { ns: 'errors', min: formatVND(minNextBid), defaultValue: `Giá đặt phải ít nhất ${formatVND(minNextBid)}` }));
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
      setSelectedBidStep(1);
      setBidSuccessPopup(tp('auctionDetail.bidSuccess'));
      if (createdBid) {
        setRecentBids((prev) => {
          const createdId = getBidIdentity(createdBid);
          const deduped = [createdBid, ...prev.filter((item) => getBidIdentity(item) !== createdId)];
          return trimBids(sortBidsByRank(deduped));
        });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const statusCode = axiosErr.response?.status;
      const serverMessage = axiosErr.response?.data?.message ?? '';

      if (statusCode === 401) {
        setBidError(tp('errors.auth.expired', { ns: 'errors', defaultValue: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để đặt giá.' }));
      } else if (statusCode === 403 || /do not have access/i.test(serverMessage)) {
        setBidError(tp('errors.bid.notAllowed', { ns: 'errors', defaultValue: 'Hiện chưa thể đặt giá cho phiên này. Vui lòng kiểm tra trạng thái phiên, trạng thái đặt cọc hoặc đăng nhập lại rồi thử lại.' }));
      } else {
        setBidError(serverMessage || tp('errors.bid.failed', { ns: 'errors', defaultValue: 'Đặt giá thất bại, vui lòng thử lại' }));
      }
    } finally {
      setBidLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setDepositError('');
    setDepositLoading(true);
    try {
      const response = await paymentApi.createDepositPayment({
        auctionId: id,
        paymentMethod: 'VNPAY',
      });

      const paymentUrl = (response as { paymentUrl?: string; paymentURL?: string }).paymentUrl
        || (response as { paymentUrl?: string; paymentURL?: string }).paymentURL;

      if (!paymentUrl) {
        setDepositError(tp('errors.payment.missingUrl', { ns: 'errors', defaultValue: 'Không nhận được đường dẫn thanh toán cọc từ hệ thống.' }));
        return;
      }

      sessionStorage.setItem(DEPOSIT_PENDING_AUCTION_ID_KEY, id);
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr.response?.data?.message ?? tp('errors.payment.initFailed', { ns: 'errors', defaultValue: 'Khởi tạo thanh toán cọc thất bại.' });

      if (message.toLowerCase().includes('deposit has already been paid')) {
        const paidFlagKey = `${DEPOSIT_PAID_AUCTION_KEY_PREFIX}${id}`;
        sessionStorage.setItem(paidFlagKey, '1');
        setIsDepositVerified(true);
        setDepositError('');
        return;
      }

      setDepositError(message);
    } finally {
      setDepositLoading(false);
    }
  };

  // Main image
  const mainImage =
    product?.images?.find((img) => img.main || img.sortOrder === 0)?.url ||
    product?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  const allImages = product?.images?.map((img) => img.url).filter(Boolean) as string[] | undefined;
  const currentImageIndex = allImages ? Math.max(0, allImages.indexOf(selectedImage || mainImage)) : 0;

  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 140; // rough height of thumbnail + gap
      thumbnailsRef.current.scrollBy({ top: direction === 'up' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (mainImage) {
      setSelectedImage(mainImage);
    }
  }, [mainImage]);

  const [fetchedWinnerEmail, setFetchedWinnerEmail] = useState<string | null>(null);

  useEffect(() => {
    if (auction?.status === 'ENDED' && auction.winnerId && !auction.winnerEmail) {
      userApi.getUserById(String(auction.winnerId))
        .then(res => {
          if (res.email) setFetchedWinnerEmail(res.email);
        })
        .catch(() => {
          // Ignore error if user fetch fails due to privacy or non-existence
        });
    }
  }, [auction?.status, auction?.winnerId, auction?.winnerEmail]);

  const statusLabel =
    auction?.status === 'ACTIVE'
      ? tp('auctionDetail.statusActive')
      : auction?.status === 'UPCOMING' || auction?.status === 'SCHEDULED'
        ? tp('auctionDetail.statusUpcoming')
        : tp('auctionDetail.statusEnded');

  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    return `${name.slice(0, Math.max(1, Math.min(3, name.length)))}***@${domain}`;
  };

  const winnerDisplay =
    fetchedWinnerEmail ? maskEmail(fetchedWinnerEmail) :
    auction?.winnerEmail ? maskEmail(auction.winnerEmail) :
    auction?.winnerUsername ? auction.winnerUsername :
    auction?.winnerName ? auction.winnerName :
    auction?.winnerId ? `NT-**${String(auction.winnerId).slice(-2)}` : '';

  const rankedBids = useMemo(() => sortBidsByRank(recentBids), [recentBids]);
  const userRankIndex = useMemo(() => rankedBids.findIndex((bid) => normalize(bid.bidderId) === normalize(currentUserId)), [rankedBids, currentUserId]);
  const userRank = userRankIndex >= 0 ? getDisplayRank(rankedBids[userRankIndex], userRankIndex) : null;
  const auctionHasStarted = auction?.startTime ? new Date(auction.startTime).getTime() <= Date.now() : false;

  const manufactureYear = product?.manufactureYear ?? product?.year;
  const derivedFromName = deriveVehicleFromName(auction?.productName || product?.name);
  const resolvedBrand = product?.brand || derivedFromName.brand;
  const resolvedModel = product?.model || derivedFromName.model;
  const resolvedYear = manufactureYear ?? derivedFromName.manufactureYear;

  const technicalSpecs = useMemo(() => [
    { label: 'Tên xe', value: auction?.productName || product?.name || '—' },
    { label: 'Số VIN', value: product?.vinNumber || '—' },
    { label: 'Hãng', value: resolvedBrand || '—' },
    { label: 'Mẫu', value: resolvedModel || '—' },
    { label: 'Năm sản xuất', value: resolvedYear ? String(resolvedYear) : '—' },
    { label: 'Màu xe', value: product?.color || '—' },
    { label: 'Số máy', value: product?.engineNumber || '—' },
    { label: 'Biển số', value: product?.licensePlate || '—' },
    { label: 'Hộp số', value: product?.transmission || '—' },
    { label: 'Nhiên liệu', value: product?.fuelType || '—' },
    { label: 'Số ODO', value: formatMileage(product?.mileage) },
    { label: 'Mô tả', value: product?.description || '—' },
  ], [auction?.productName, product, resolvedBrand, resolvedModel, resolvedYear]);

  const rankingRows = useMemo(() => recentBids.length >= RANKING_VISIBLE_ROWS
    ? rankedBids
    : [
      ...rankedBids,
      ...Array.from({ length: RANKING_VISIBLE_ROWS - rankedBids.length }, () => null),
    ], [recentBids.length, rankedBids]);

  if (loading) return <div className={styles.loading}>{tp('auctionDetail.loading')}</div>;

  if (error || !auction) {
    return (
      <div className={styles.errorContainer}>
        <h2>{tp('auctionDetail.notFoundTitle')}</h2>
        <p>{error}</p>
        <Link to="/auctions">
          <Button variant="secondary">{tp('auctionDetail.backToList')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans text-slate-800">
      
      {/* 1. NOTIFICATIONS & ALERTS */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {bidSuccessPopup && (
          <div className="pointer-events-auto shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-8">
            <Alert variant="success" title="Thành công" content={bidSuccessPopup} onClose={() => setBidSuccessPopup('')} />
          </div>
        )}
        {extensionPopup && (
          <div className="pointer-events-auto shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-8">
            <Alert variant="warning" title={tp('auctionDetail.liveExtensionTitle')} content={extensionPopup} onClose={() => setExtensionPopup('')} />
          </div>
        )}
        {(latestMessage || notification?.content) && (
          <div className="pointer-events-auto bg-[#1e293b] text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8">
             <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">🔔</div>
             <p className="font-medium text-sm leading-relaxed">{notification?.content ?? latestMessage}</p>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* 2. HEADER */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/auctions" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2e3d83] font-bold tracking-wide uppercase text-sm transition-colors py-2 px-4 rounded-full hover:bg-slate-100">
            <ArrowLeft size={16} strokeWidth={2.5} /> {tp('auctionDetail.backToList')}
          </Link>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isConnected ? tp('auctionDetail.autoUpdating') : tp('auctionDetail.resyncing')}
            </span>
          </div>
        </div>

        {/* 3. SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* LEFT COLUMN: Gallery & Specs (60%) */}
          <div className="flex-1 w-full lg:w-[60%] flex flex-col gap-8">
            
            {/* Gallery */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative flex flex-col md:flex-row h-[400px] md:h-[500px]">
              
              {/* Main Image Area */}
              <div 
                className="flex-1 relative bg-slate-900 overflow-hidden group cursor-zoom-in"
                onClick={() => setZoomedImage(selectedImage || mainImage)}
              >
                <img src={selectedImage || mainImage} alt={auction.productName ?? 'Xe đấu giá'} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                
                {/* Verified Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 z-10 shadow-lg border border-white/10">
                  <ImageIcon size={14} /> V-Auction Verified
                </div>
                
                {/* Counter Badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded z-10 tracking-widest">
                  {currentImageIndex + 1} / {allImages?.length || 1}
                </div>
              </div>

              {/* Thumbnails Sidebar (Desktop) */}
              {allImages && allImages.length > 1 && (
                <div className="hidden md:flex flex-col w-[100px] xl:w-[130px] bg-white border-l border-slate-200 relative">
                  <button 
                    onClick={() => scrollThumbnails('up')}
                    className="h-10 w-full flex items-center justify-center bg-slate-300 hover:bg-slate-400 transition-colors text-white shrink-0"
                  >
                    <ChevronUp size={28} strokeWidth={3} />
                  </button>
                  
                  <div 
                    ref={thumbnailsRef}
                    className="flex-1 overflow-y-auto no-scrollbar flex flex-col scroll-smooth gap-1 p-1 bg-white"
                  >
                    {allImages.map((url, idx) => (
                      <button 
                        key={idx} 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(url); }} 
                        className={`relative w-full aspect-[4/3] shrink-0 transition-all duration-200 ${selectedImage === url ? 'border-[3px] border-red-500 p-0 transform scale-100 z-10' : 'border-[3px] border-transparent opacity-80 hover:opacity-100'}`}
                      >
                        <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => scrollThumbnails('down')}
                    className="h-10 w-full flex items-center justify-center bg-slate-300 hover:bg-slate-400 transition-colors text-white shrink-0"
                  >
                    <ChevronDown size={28} strokeWidth={3} />
                  </button>
                </div>
              )}
                
              {/* Mobile horizontal scroll for thumbnails */}
              {allImages && allImages.length > 1 && (
                <div className="absolute bottom-4 left-0 w-full px-4 flex gap-3 overflow-x-auto no-scrollbar md:hidden z-10">
                   {allImages.map((url, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(url); }} 
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-md shrink-0 ${selectedImage === url ? 'border-red-500 scale-105' : 'border-white/40 opacity-80'}`}
                    >
                      <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3"><CalendarDays size={20} /></div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Năm SX</span>
                <span className="font-extrabold text-slate-800 text-lg">{resolvedYear || '—'}</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3"><Gauge size={20} /></div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Số Km</span>
                <span className="font-extrabold text-slate-800 text-lg">{formatMileage(product?.mileage) || '—'}</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3"><Settings2 size={20} /></div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Hộp Số</span>
                <span className="font-extrabold text-slate-800 text-sm mt-1">{product?.transmission || '—'}</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-3"><Droplets size={20} /></div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Động cơ</span>
                <span className="font-extrabold text-slate-800 text-sm mt-1">{product?.fuelType || '—'}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="flex items-center border-b border-slate-100 p-2 bg-slate-50/50">
                <button type="button" onClick={() => setActiveTab('overview')} className={`flex-1 py-4 text-sm font-bold tracking-wide uppercase transition-all duration-300 rounded-2xl ${activeTab === 'overview' ? 'bg-[#2e3d83] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>TỔNG QUAN</button>
                <button type="button" onClick={() => setActiveTab('specs')} className={`flex-1 py-4 text-sm font-bold tracking-wide uppercase transition-all duration-300 rounded-2xl ${activeTab === 'specs' ? 'bg-[#2e3d83] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>THỐNG SỐ</button>
              </div>
              
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle2 className="text-[#f4c23d]" size={24} /> Giới Thiệu Chung</h3>
                      <p className="text-slate-600 leading-relaxed max-w-3xl">{product?.description || 'Chiếc xe này chưa được cập nhật mô tả chi tiết. Vui lòng xem ở phần thông số hoặc liên hệ hỗ trợ.'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                      <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2"><AlertCircle size={18} /> Lưu ý trước khi đấu giá</h4>
                      <p className="text-amber-700/80 text-sm leading-relaxed">{tp('auctionDetail.noteConditionValue')}. Bằng việc đặt mua, bạn đồng ý với mọi chính sách của hệ thống.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2"><Settings2 className="text-[#f4c23d]" size={24} /> Bảng Thông Số Kỹ Thuật</h3>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      {technicalSpecs.map((spec, idx) => (
                        <div key={spec.label} className={`flex items-center p-4 border-b border-slate-100 last:border-0 ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                           <span className="w-1/3 text-sm font-bold text-slate-500">{spec.label}</span>
                           <span className="w-2/3 text-sm font-medium text-slate-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                    {productFetchError && (
                      <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                        {productFetchError} (Hệ thống chỉ hiển thị thông tin trích xuất tạm thời)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Bidding Console (40%) */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-[110px] bg-white rounded-[2rem] shadow-2xl shadow-[#2e3d83]/10 border border-slate-100 overflow-hidden flex flex-col">
              
              {/* Header Info */}
              <div className="p-8 bg-gradient-to-br from-[#1e293b] to-[#2e3d83] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${auction?.status === 'ACTIVE' ? 'bg-[#f4c23d] text-slate-900 border-2 border-transparent' : 'bg-white/10 text-white backdrop-blur-md border border-white/20'}`}>
                      {statusLabel}
                    </span>
                    <button 
                      onClick={toggleWatchlist}
                      disabled={watchlistLoading}
                      title={isWatchlisted ? "Bỏ Lưu Xe" : "Lưu Xe Để Theo Dõi"}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isWatchlisted ? 'bg-white text-red-500 shadow-xl scale-110' : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'}`}
                    >
                      <Heart size={22} className={isWatchlisted ? 'fill-red-500' : ''} />
                    </button>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-2 drop-shadow-md !text-white pr-10">{auction.productName}</h1>
                  <p className="text-blue-100/90 text-sm font-medium opacity-90 mb-6">Mã phiên: {String(auction.id).slice(0,8).toUpperCase()} • Người tạo: {auction.createdBy}</p>
                  
                  {/* Countdown UI */}
                  <CountdownDisplay 
                    startTime={auction?.startTime} 
                    endTime={auction?.endTime} 
                    actualEndTime={auction?.actualEndTime}
                    auctionHasStarted={auctionHasStarted} 
                    isEnded={isEnded} 
                    extensionBadgeMinutes={extensionBadgeMinutes} 
                  />
                </div>
              </div>

              {/* Price Row */}
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{isEnded && winnerDisplay ? `🎉 Ng. Thắng: ${winnerDisplay}` : 'Giá Khởi Điểm'}</p>
                  <p className="text-slate-500 font-semibold">{isEnded && winnerDisplay ? '' : formatVND(auction.startPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e3d83] uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Trophy size={14}/> GIÁ HIỆN TẠI</p>
                  <p className="text-3xl font-black text-[#2e3d83]">{formatVND(displayPrice)}</p>
                </div>
              </div>

              {/* Bidding Actions */}
              <div className="p-8 pb-6">
                {!isEnded && isAuthenticated ? (
                  <>
                    {!isDepositVerified && !checkingDeposit && (
                       <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-blue-100">
                         <MapPin className="shrink-0 mt-0.5" /> Yêu cầu nộp tiền cọc {formatVND(auction.depositAmount)} trước khi thao tác đặt giá.
                       </div>
                    )}
                    
                    {checkingDeposit ? (
                       <button className="w-full bg-slate-200 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed">Đang kiểm tra trạng thái cọc...</button>
                    ) : isDepositVerified ? (
                      auction.status === 'UPCOMING' || auction.status === 'SCHEDULED' ? (
                        <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 font-bold border border-emerald-100 shadow-sm text-center">
                          <CheckCircle2 size={36} className="text-emerald-500" />
                          <p className="text-lg">Đã Nộp Cọc Thành Công</p>
                          <p className="text-sm font-medium opacity-80">Hệ thống đã ghi nhận tiền cọc của bạn. Vui lòng quay lại đặt giá khi phiên đấu giá thức mở.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                             <span className="text-sm font-bold text-slate-500 uppercase">Bước Giá: {formatVND(bidStepValue)}</span>
                             <span className="text-xs font-bold bg-[#2e3d83] text-white px-3 py-1 rounded-full">{userRank ? `Vị trí thứ ${userRank}` : 'Chưa xếp hạng'}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                             {stepOptions.map(step => (
                                <button key={step} onClick={() => setSelectedBidStep(step)} className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${selectedBidStep === step ? 'bg-slate-900 border-slate-900 text-white shadow-lg -translate-y-0.5' : 'bg-white border-slate-200 text-slate-600 hover:border-[#2e3d83] hover:text-[#2e3d83]'}`}>
                                  +{step}
                                </button>
                             ))}
                          </div>
                          <button onClick={handlePlaceBid} disabled={bidLoading} className="w-full bg-gradient-to-r from-[#f4c23d] to-[#ffcf4c] hover:opacity-90 active:scale-[0.98] transition-all text-slate-900 font-black text-lg h-14 rounded-2xl uppercase tracking-widest shadow-xl shadow-[#f4c23d]/20 flex items-center justify-center gap-2">
                            {bidLoading ? 'ĐANG THEO GIÁ...' : `ĐẶT ${formatVND(selectedBidAmount)}`} <Send size={20}/>
                          </button>
                          {bidError && <p className="text-red-500 text-sm font-bold mt-2 text-center bg-red-50 py-2 rounded-lg">{bidError}</p>}
                        </div>
                      )
                    ) : (
                      <>
                        <button onClick={handleDeposit} disabled={depositLoading} className="w-full bg-[#2e3d83] hover:bg-[#1f2f6d] active:scale-[0.98] transition-all text-white font-black text-lg h-14 rounded-2xl uppercase tracking-widest shadow-xl shadow-[#2e3d83]/20">
                           {depositLoading ? 'ĐANG KHỞI TẠO...' : (auction.status === 'UPCOMING' || auction.status === 'SCHEDULED' ? 'ĐĂNG KÝ ĐẶT CỌC VNPAY' : 'NỘP CỌC BẰNG VNPAY')}
                        </button>
                        {depositError && <p className="text-red-500 text-sm font-bold mt-2 text-center">{depositError}</p>}
                      </>
                    )}
                  </>
                ) : !isEnded && !isAuthenticated ? (
                  <Link to="/login" className="flex items-center justify-center w-full bg-[#2e3d83] hover:bg-[#1f2f6d] transition-all text-white font-black text-lg h-14 rounded-2xl uppercase tracking-widest shadow-lg">
                    ĐĂNG NHẬP ĐỂ ĐẶT GIÁ
                  </Link>
                ) : (
                  <button className="w-full bg-slate-200 text-slate-500 font-black text-lg h-14 rounded-2xl uppercase tracking-widest cursor-not-allowed">
                     PHIÊN ĐÃ KẾT THÚC
                  </button>
                )}
              </div>

              {/* Ranking Leaderboard Mini */}
              <div className="bg-slate-50 flex-1 p-8 border-t border-slate-100 flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-2"><Trophy className="text-[#f4c23d]" size={18}/> Bảng Xếp Hạng ({rankedBids.length})</h4>
                 </div>
                 <div className="flex-1 overflow-y-auto max-h-[220px] pr-2 space-y-3 custom-scrollbar">
                    {rankingRows.map((bid, index) => {
                       const rank = bid ? getDisplayRank(bid, index) : index + 1;
                       const isGold = rank === 1;
                       return (
                          <div key={bid ? getBidIdentity(bid) : `rank-${index}`} className={`flex items-center justify-between p-3 rounded-xl border ${bid ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-dashed border-slate-200 opacity-50'}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isGold ? 'bg-[#f4c23d] text-slate-900 shadow-md shadow-[#f4c23d]/20' : 'bg-slate-100 text-slate-500'}`}>#{rank}</div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-slate-800">{bid ? formatVND(bid.amount) : '---'}</span>
                                   <span className="text-[10px] uppercase font-bold text-slate-400">{bid ? (bid.bidderMask ?? 'ẨN DANH') : 'CHỜ ĐẶT GIÁ'}</span>
                                </div>
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{bid ? formatDateTime(bid.createdAt).split(' ')[1] : '--:--'}</span>
                          </div>
                       )
                    })}
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Winner Modal & Confetti Overlay */}
      {showWinnerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Modal Backdrop with better blur */}
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[8px] animate-in fade-in duration-700" onClick={() => setShowWinnerModal(false)}></div>
           
           <div className="relative bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-12 max-w-md w-full text-center overflow-visible animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 scale-110">
              
              {/* Animated Trophy Icon */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce-slow ring-8 ring-white">
                <Trophy size={56} />
              </div>

              {/* Confetti Pieces (more and better looking) */}
              <div className="confetti-container absolute inset-0 overflow-visible pointer-events-none">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`confetti-piece piece-${i}`}></div>
                  ))}
              </div>

              <div className="mt-8">
                <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">XIN CHÚC MỪNG!</h2>
                <div className="h-1 w-20 bg-amber-400 mx-auto mb-6 rounded-full"></div>
                
                <p className="text-slate-600 mb-8 font-medium leading-relaxed">
                  Bạn là người trả giá cao nhất cho <br/>
                  <span className="text-[#2e3d83] font-bold text-lg">{auction?.productName}</span> <br/>
                  với số tiền cực kỳ ấn tượng <br/>
                  <span className="text-emerald-600 font-extrabold text-2xl drop-shadow-sm">{formatVND(auction?.currentPrice)}</span>
                </p>
                
                <button 
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full py-5 bg-gradient-to-r from-[#2e3d83] to-[#1e293b] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all mb-3"
                >
                  XÁC NHẬN CHIẾN THẮNG
                </button>
                <button
                  onClick={() => { setShowWinnerModal(false); navigate('/orders'); }}
                  className="w-full py-3 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all"
                >
                  Xem & Thanh Toán Hợp Đồng →
                </button>
              </div>

              {/* Floating Stars */}
              <div className="absolute -right-4 -top-4 text-yellow-500 animate-pulse"><Trophy size={32} /></div>
              <div className="absolute -left-4 top-20 text-yellow-400 animate-bounce delay-150"><Trophy size={20} /></div>
           </div>
        </div>
      )}

      {/* Outbid Banner */}
      {showOutbidBanner && outbidNotification && (
        <div className="fixed top-6 right-6 z-[90] max-w-sm animate-in slide-in-from-right duration-500">
          <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-red-400">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ChevronUp size={20} className="text-white"/>
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{outbidNotification.title || 'Bạn bị vượt giá!'}</p>
              <p className="text-red-100 text-xs mt-1 leading-relaxed">{outbidNotification.content || 'Người khác vừa đặt giá cao hơn. Hãy tăng giá ngay!'}</p>
            </div>
            <button onClick={() => setShowOutbidBanner(false)} className="text-white/60 hover:text-white ml-1">
              <X size={16}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -15px); }
        }

        .confetti-piece {
          position: absolute;
          width: 10px; height: 10px;
          top: -20px;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
        }

        ${[...Array(40)].map((_, i) => `
          .piece-${i} {
            left: ${Math.random() * 100}%;
            background: ${['#f4c23d', '#2e3d83', '#de3c4b', '#1ea971', '#3864d1', '#f97316', '#a855f7'][i % 7]};
            animation-duration: ${1.5 + Math.random() * 2.5}s;
            animation-delay: ${Math.random() * 3}s;
            transform: rotate(${Math.random() * 360}deg);
            width: ${6 + Math.random() * 8}px;
            height: ${6 + Math.random() * 12}px;
          }
        `).join('')}

        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"><X size={24}/></button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}

    </div>
  );
};
