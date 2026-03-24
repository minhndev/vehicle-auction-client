import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { catalogApi } from '../../api/catalogApi';
import { paymentApi } from '../../api/paymentApi';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import type { AuctionResponse, BidResponse, ProductResponse } from '../../types/index';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { usePageI18n } from '../../i18n/usePageI18n';
import type { RootState } from '../../store';
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
  return [...items].sort((a, b) => {
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
      return amountB - amountA;
    }

    const timeA = new Date(a.createdAt ?? 0).getTime();
    const timeB = new Date(b.createdAt ?? 0).getTime();
    return timeB - timeA;
  });
};

const getDisplayRank = (bid: BidResponse, index: number): number => {
  const rank = Number(bid.rank);
  if (Number.isFinite(rank) && rank > 0) {
    return rank;
  }
  return index + 1;
};

const getRankBadgeClass = (rank: number, css: Record<string, string>): string => {
  if (rank === 1) return `${css.rankBadge} ${css.rankGold}`;
  if (rank === 2) return `${css.rankBadge} ${css.rankSilver}`;
  if (rank === 3) return `${css.rankBadge} ${css.rankBronze}`;
  return `${css.rankBadge} ${css.rankDefault}`;
};

export const AuctionDetail: React.FC = () => {
  const { tp } = usePageI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

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
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'auction'>('overview');
  const bidsFailCountRef = useRef(0);
  const bidsCooldownUntilRef = useRef(0);

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

  const { currentPrice: wsPrice, latestMessage, notification, depositStatusMessage, isConnected } = useAuctionWebSocket(id ?? '');

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

  const isEnded =
    auction?.status === 'COMPLETED' ||
    auction?.status === 'CANCELLED' ||
    auction?.status === 'FAILED';

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

  useEffect(() => {
    if (mainImage) {
      setSelectedImage(mainImage);
    }
  }, [mainImage]);

  const statusToneClass =
    auction?.status === 'ACTIVE'
      ? styles.statusLive
      : auction?.status === 'UPCOMING' || auction?.status === 'SCHEDULED'
        ? styles.statusUpcoming
        : styles.statusEnded;

  const statusLabel =
    auction?.status === 'ACTIVE'
      ? tp('auctionDetail.statusActive')
      : auction?.status === 'UPCOMING' || auction?.status === 'SCHEDULED'
        ? tp('auctionDetail.statusUpcoming')
        : tp('auctionDetail.statusEnded');

  const winnerDisplay =
    auction?.winnerEmail
    || auction?.winnerUsername
    || auction?.winnerName
    || auction?.winnerId
    || '';

  const rankedBids = sortBidsByRank(recentBids);
  const userRankIndex = rankedBids.findIndex((bid) => normalize(bid.bidderId) === normalize(currentUserId));
  const userRank = userRankIndex >= 0 ? getDisplayRank(rankedBids[userRankIndex], userRankIndex) : null;
  const auctionHasStarted = auction?.startTime ? new Date(auction.startTime).getTime() <= Date.now() : false;
  const startCountdown = useCountdown(auction?.startTime ?? '');
  const endCountdown = useCountdown(auction?.endTime ?? '');
  const manufactureYear = product?.manufactureYear ?? product?.year;
  const derivedFromName = deriveVehicleFromName(auction?.productName || product?.name);
  const resolvedBrand = product?.brand || derivedFromName.brand;
  const resolvedModel = product?.model || derivedFromName.model;
  const resolvedYear = manufactureYear ?? derivedFromName.manufactureYear;

  const technicalSpecs: Array<{ label: string; value: string }> = [
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
  ];

  const rankingRows: Array<BidResponse | null> = recentBids.length >= RANKING_VISIBLE_ROWS
    ? rankedBids
    : [
      ...rankedBids,
      ...Array.from({ length: RANKING_VISIBLE_ROWS - rankedBids.length }, () => null),
    ];

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
    <div className={styles.container}>
      {bidSuccessPopup && (
        <div className={styles.popupAlertWrap}>
          <Alert
            variant="success"
            title="Thành công"
            content={bidSuccessPopup}
            onClose={() => setBidSuccessPopup('')}
          />
        </div>
      )}

      {extensionPopup && (
        <div className={styles.popupAlertWrap} style={{ top: 154 }}>
          <Alert
            variant="warning"
            title={tp('auctionDetail.liveExtensionTitle')}
            content={extensionPopup}
            onClose={() => setExtensionPopup('')}
          />
        </div>
      )}

      <div className={styles.headerRow}>
        <Link to="/auctions" className={styles.backLink}>
          ← {tp('auctionDetail.backToList')}
        </Link>
        <div className={styles.liveState}>
          <span className={`${styles.dot} ${isConnected ? styles.dotOn : styles.dotOff}`} />
          {isConnected ? tp('auctionDetail.autoUpdating') : tp('auctionDetail.resyncing')}
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
              {tp('auctionDetail.overview')}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              {tp('auctionDetail.specs')}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'auction' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('auction')}
            >
              {tp('auctionDetail.auctionInfoTab')}
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>{tp('auctionDetail.overviewTitle')}</h3>
              <ul className={styles.specsList}>
                <li><strong>{tp('auctionDetail.startPrice')}:</strong> {formatVND(auction.startPrice)}</li>
                <li><strong>{tp('auctionDetail.currentPrice')}:</strong> {formatVND(displayPrice)}</li>
                <li><strong>{tp('auctionDetail.bidStep')}:</strong> {formatVND(auction.bidIncrement)}</li>
                <li><strong>{tp('auctionDetail.deposit')}:</strong> {formatVND(auction.depositAmount)}</li>
                {auction.startTime && <li><strong>{tp('auctionDetail.startTime')}:</strong> {formatDateTime(auction.startTime)}</li>}
                {auction.endTime && <li><strong>{tp('auctionDetail.endTime')}:</strong> {formatDateTime(auction.endTime)}</li>}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>Thông số kỹ thuật</h3>
              <ul className={styles.specsList}>
                {technicalSpecs.map((spec) => (
                  <li key={spec.label}>
                    <strong>{spec.label}:</strong> {spec.value}
                  </li>
                ))}
              </ul>
              {!product && !productFetchError && (
                <p className={styles.specHint}>
                  Chưa tải được đầy đủ dữ liệu sản phẩm từ dịch vụ catalog. Các thông tin khả dụng từ phiên đấu giá vẫn đang được hiển thị.
                </p>
              )}
              {productFetchError && (
                <p className={styles.specHint} style={{ color: '#ef4444', fontWeight: 500 }}>
                  {productFetchError} (Hệ thống chỉ hiển thị thông tin trích xuất tạm thời)
                </p>
              )}
            </div>
          )}

          {activeTab === 'auction' && (
            <div className={styles.vehicleSpecs}>
              <h3 className={styles.specsTitle}>{tp('auctionDetail.auctionInfo')}</h3>
              <ul className={styles.metaList}>
                {auction.startTime && (
                  <li><strong>{tp('auctionDetail.startTime')}:</strong> {new Date(auction.startTime).toLocaleString('vi-VN')}</li>
                )}
                {auction.endTime && (
                  <li><strong>{tp('auctionDetail.endTime')}:</strong> {new Date(auction.endTime).toLocaleString('vi-VN')}</li>
                )}
                {winnerDisplay && (
                  <li><strong>{tp('auctionDetail.winner')}:</strong> {winnerDisplay}</li>
                )}
                {auction.createdBy && (
                  <li><strong>{tp('auctionDetail.createdBy')}:</strong> {auction.createdBy}</li>
                )}
              </ul>
            </div>
          )}

          <div className={styles.vehicleSpecs}>
            <h3 className={styles.specsTitle}>{tp('auctionDetail.bidNotes')}</h3>
            <ul className={styles.metaList}>
              <li><strong>{tp('auctionDetail.noteCondition')}:</strong> {tp('auctionDetail.noteConditionValue')}</li>
              <li><strong>{tp('auctionDetail.noteRecommendation')}:</strong> {tp('auctionDetail.noteRecommendationValue')}</li>
              <li><strong>{tp('auctionDetail.noteRealtime')}:</strong> {tp('auctionDetail.noteRealtimeValue')}</li>
            </ul>
          </div>

        </div>

        <div className={styles.biddingSection}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{auction.productName}</h1>
            <p className={styles.subtitle}>{tp('auctionDetail.subtitle')}</p>
            <span className={`${styles.statusBadge} ${statusToneClass}`}>{statusLabel}</span>
            {isDepositVerified && (
              <span className={styles.depositVerifiedBadge}>{tp('auctionDetail.depositPaid')}</span>
            )}
            <div className={styles.summaryChips}>
              <span className={styles.chip}>{tp('auctionDetail.auctionCode')}: {String(auction.id).slice(0, 8)}</span>
              <span className={styles.chip}>{tp('auctionDetail.bidStep')}: {formatVND(auction.bidIncrement)}</span>
              <span className={styles.chip}>{tp('auctionDetail.deposit')}: {formatVND(auction.depositAmount)}</span>
            </div>
          </div>

          <div className={`${styles.sellerInfo} ${styles.rankingCard}`}>
            <div className={styles.activityHeader}>
              <h3 className={styles.specsTitle}>{tp('auctionDetail.rankingTitle')}</h3>
              <span className={styles.activityCount}>{tp('auctionDetail.recentBids', { count: rankedBids.length })}</span>
            </div>
            <div className={styles.activityFrame}>
              <ul className={styles.activityList}>
                {rankingRows.map((bid, index) => (
                  <li
                    key={bid ? getBidIdentity(bid) : `ranking-empty-${index + 1}`}
                    className={`${styles.activityItem} ${!bid ? styles.activityPlaceholder : ''}`}
                  >
                    <div>
                      <p className={styles.activityPrice}>
                        <span className={getRankBadgeClass(bid ? getDisplayRank(bid, index) : index + 1, styles)}>
                          TOP {bid ? getDisplayRank(bid, index) : index + 1}
                        </span>
                        {bid ? formatVND(bid.amount) : '---'}
                      </p>
                      <p className={styles.activityMeta}>
                        {bid
                          ? `${tp('auctionDetail.bidderLabel')}: ${bid.bidderMask ?? bid.bidderId?.slice(0, 8) ?? tp('auctionDetail.anonymous')}`
                          : tp('auctionDetail.waitingBid')}
                      </p>
                    </div>
                    <span className={styles.activityTime}>{bid ? formatDateTime(bid.createdAt) : '--:--'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`${styles.bidBox} ${styles.auctionCard}`}>
            <div className={styles.timerPanel}>
              <div className={styles.timerItem}>
                <div className={styles.timerLabelGroup}>
                  <span className={styles.timerLabel}>{tp('auctionDetail.startCountdown')}</span>
                </div>
                {auctionHasStarted ? (
                  <span className={styles.timerItemEnded}>{tp('auctionDetail.started')}</span>
                ) : startCountdown ? (
                  <span className={styles.timerValue}>
                    {startCountdown.hours}h {startCountdown.minutes}m {startCountdown.seconds}s
                  </span>
                ) : (
                  <span className={styles.timerValue}>—</span>
                )}
              </div>

              <div className={styles.timerItem}>
                <div className={styles.timerLabelGroup}>
                  <span className={styles.timerLabel}>{tp('auctionDetail.endCountdown')}</span>
                  {extensionBadgeMinutes > 0 && (
                    <span className={styles.extensionBadge}>{tp('auctionDetail.extendedMinutes', { minutes: extensionBadgeMinutes })}</span>
                  )}
                </div>
                {isEnded ? (
                  <span className={styles.endedText}>{tp('auctionDetail.statusEnded')}</span>
                ) : endCountdown ? (
                  <span className={styles.timerValue}>
                    {endCountdown.hours}h {endCountdown.minutes}m {endCountdown.seconds}s
                  </span>
                ) : (
                  <span className={styles.timerValue}>—</span>
                )}
              </div>
            </div>

            <div className={styles.priceRow}>
              <div className={styles.pricePrimary}>
                <p className={styles.priceLabel}>{tp('auctionDetail.currentPrice')}</p>
                <p className={styles.currentPrice}>{formatVND(displayPrice)}</p>
              </div>
              <div className={styles.priceMetaBlock}>
                <p className={styles.bidsCount}>{tp('auctionDetail.startPrice')}</p>
                <p className={styles.startPrice}>{formatVND(auction.startPrice)}</p>
              </div>
            </div>

            {auction.bidIncrement && (
              <p className={styles.metaLine}>
                {tp('auctionDetail.minBidStep')}: <strong>{formatVND(auction.bidIncrement)}</strong>
                &nbsp;|&nbsp;
                {tp('auctionDetail.deposit')}: <strong>{formatVND(auction.depositAmount)}</strong>
              </p>
            )}

            <div className={styles.actionRow}>
              {!isEnded && isAuthenticated ? (
                <div className={styles.bidForm}>
                  {!isDepositVerified && !checkingDeposit && (
                    <div className={styles.metaLine}>
                      {tp('auctionDetail.needDeposit')}
                    </div>
                  )}
                  {checkingDeposit ? (
                    <Button variant="secondary" size="lg" className={styles.fullWidthBtn} disabled>
                      {tp('auctionDetail.checkingDeposit')}
                    </Button>
                  ) : isDepositVerified ? (
                    <>
                      <div className={styles.bidPresetBlock}>
                        <div className={styles.topRankHint}>
                          {userRank ? tp('auctionDetail.topRank', { rank: userRank }) : tp('auctionDetail.notRanked')}
                        </div>
                        <p className={styles.stepLabel}>{tp('auctionDetail.chooseBidLevel')}</p>
                        <div className={styles.stepOptions}>
                          {stepOptions.map((step) => {
                            const stepAmount = displayPrice + (bidStepValue * step);
                            return (
                              <button
                                key={step}
                                type="button"
                                className={`${styles.stepBtn} ${selectedBidStep === step ? styles.stepBtnActive : ''}`}
                                onClick={() => setSelectedBidStep(step)}
                              >
                                {tp('auctionDetail.plusStep', { step, amount: formatVND(stepAmount) })}
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handlePlaceBid}
                          disabled={bidLoading}
                          className={styles.fullWidthBtn}
                        >
                          {bidLoading ? tp('auctionDetail.placing') : tp('auctionDetail.placeBid', { amount: formatVND(selectedBidAmount) })}
                        </Button>
                      </div>
                      {bidError && (
                        <p className={styles.errorText}>{bidError}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleDeposit}
                        disabled={depositLoading}
                        className={styles.fullWidthBtn}
                      >
                        {depositLoading ? tp('auctionDetail.startingPayment') : tp('auctionDetail.depositToJoin')}
                      </Button>
                      {depositError && (
                        <p className={styles.errorText}>{depositError}</p>
                      )}
                    </>
                  )}
                </div>
              ) : !isEnded && !isAuthenticated ? (
                <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                  <Button variant="secondary" size="lg" className={styles.fullWidthBtn}>
                    {tp('auctionDetail.loginToBid')}
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="lg" className={styles.fullWidthBtn} disabled>
                  {tp('auctionDetail.auctionEnded')}
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
