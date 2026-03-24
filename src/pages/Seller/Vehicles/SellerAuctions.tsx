import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { AuctionRequest, AuctionResponse, ProductResponse } from '../../../types/index';
import styles from './SellerAuctions.module.css';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

const toBackendLocalDateTime = (input: string): string => {
  // Input from datetime-local is usually: 2026-03-24T21:30
  // Backend contract expects local datetime: 2026-03-24T21:30:00 (no timezone suffix).
  if (!input) return input;
  return input.length === 16 ? `${input}:00` : input;
};

export const SellerAuctions: React.FC = () => {
  const { tp, getAuctionStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [depositMode, setDepositMode] = useState<'MANUAL' | 'PERCENT_OF_AUCTION' | 'PERCENT_OF_PRODUCT'>('PERCENT_OF_AUCTION');
  const [depositPercent, setDepositPercent] = useState(10);
  const [formData, setFormData] = useState<AuctionRequest>({
    productId: '',
    startTime: '',
    endTime: '',
    startPrice: 0,
    bidIncrement: 500000,
    depositAmount: 10000000,
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehicleData, auctionData] = await Promise.all([
        sellerApi.getMyVehicles(),
        auctionApi.getPublicAuctions({
          page: 0,
          size: 100,
          sort: 'createdAt,desc',
          ...(filterStatus !== 'ALL' ? { status: filterStatus } : {}),
        }),
      ]);

      const myVehicles = Array.isArray(vehicleData) ? vehicleData : (vehicleData as any)?.content || [];
      setVehicles(myVehicles);

      const rawAuctions = Array.isArray((auctionData as any)?.content) ? (auctionData as any).content : [];
      const myProductIds = new Set(myVehicles.map((vehicle: ProductResponse) => String(vehicle.id)));
      const myAuctions = rawAuctions.filter((auction: AuctionResponse) => myProductIds.has(String(auction.productId)));

      setAuctions(myAuctions);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || tp('sellerAuctions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return tp('shared.status.unknown');
    const product = vehicles.find((vehicle) => String(vehicle.id) === String(productId));
    return product?.name || `${product?.brand || ''} ${product?.model || ''}`.trim() || productId;
  };

  const auctionProductIds = new Set(
    auctions
      .filter((auction) => auction.status === 'UPCOMING' || auction.status === 'ACTIVE')
      .map((auction) => String(auction.productId))
  );

  const eligibleProducts = vehicles.filter(
    (vehicle) =>
      (vehicle.status === 'APPROVED' || vehicle.status === 'IN_AUCTION') &&
      !!vehicle.id &&
      !auctionProductIds.has(String(vehicle.id))
  );

  const selectedProduct = eligibleProducts.find((product) => String(product.id) === String(formData.productId));

  const productValue = Number(selectedProduct?.startPrice || selectedProduct?.basePrice || 0);

  const getDepositBaseAmount = () => {
    if (depositMode === 'PERCENT_OF_PRODUCT') {
      return productValue;
    }
    return Number(formData.startPrice) || 0;
  };

  const computedDepositAmount = Math.max(0, Math.round((getDepositBaseAmount() * Number(depositPercent || 0)) / 100));

  const suggestedDepositMin = Math.round((getDepositBaseAmount() * 5) / 100);
  const suggestedDepositMax = Math.round((getDepositBaseAmount() * 20) / 100);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      setError(tp('sellerAuctions.selectProductRequired'));
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError(tp('sellerAuctions.timeRequired'));
      return;
    }

    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setError(tp('sellerAuctions.invalidTimeRange'));
      return;
    }

    const effectiveDeposit = depositMode === 'MANUAL' ? Number(formData.depositAmount) : computedDepositAmount;
    if (!Number.isFinite(effectiveDeposit) || effectiveDeposit <= 0) {
      setError(tp('sellerAuctions.invalidDeposit'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await auctionApi.createAuction({
        productId: formData.productId,
        startTime: toBackendLocalDateTime(formData.startTime),
        endTime: toBackendLocalDateTime(formData.endTime),
        startPrice: Number(formData.startPrice),
        bidIncrement: Number(formData.bidIncrement),
        depositAmount: effectiveDeposit,
      });

      setFormData({
        productId: '',
        startTime: '',
        endTime: '',
        startPrice: 0,
        bidIncrement: 500000,
        depositAmount: 10000000,
      });
      setDepositMode('PERCENT_OF_AUCTION');
      setDepositPercent(10);

      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || tp('sellerAuctions.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    if (search && !getProductName(auction.productId).toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{tp('sellerAuctions.title')}</h1>
        <Link to="/seller/products" style={{ textDecoration: 'none' }}>
           <Button variant="outline">{tp('sellerAuctions.openProductsPage')}</Button>
        </Link>
      </div>

      <form onSubmit={handleCreateAuction} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>{tp('sellerAuctions.createTitle')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <select
            className={styles.filterSelect}
            value={formData.productId}
            onChange={(e) => {
              const productId = e.target.value;
              const product = eligibleProducts.find((item) => String(item.id) === String(productId));
              const suggestedStartPrice = Number(product?.startPrice || product?.basePrice || 0);
              setFormData((prev) => ({
                ...prev,
                productId,
                startPrice: suggestedStartPrice > 0 ? suggestedStartPrice : prev.startPrice,
              }));
            }}
            required
          >
            <option value="">{tp('sellerAuctions.selectApprovedProduct')}</option>
            {eligibleProducts.map((product) => (
              <option key={product.id} value={String(product.id)}>
                {product.name || `${product.brand} ${product.model}`}
              </option>
            ))}
          </select>

          <input
            className={styles.filterSelect}
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
            required
          />

          <input
            className={styles.filterSelect}
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
            required
          />

          <input
            className={styles.filterSelect}
            type="number"
            min={1000000}
            value={formData.startPrice || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, startPrice: Number(e.target.value) }))}
            placeholder={tp('sellerAuctions.startPrice')}
            required
          />

          <input
            className={styles.filterSelect}
            type="number"
            min={1000}
            value={formData.bidIncrement || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, bidIncrement: Number(e.target.value) }))}
            placeholder={tp('sellerAuctions.bidIncrement')}
            required
          />

          <input
            className={styles.filterSelect}
            type="number"
            min={0}
            value={depositMode === 'MANUAL' ? formData.depositAmount || '' : computedDepositAmount || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, depositAmount: Number(e.target.value) }))}
            placeholder={tp('sellerAuctions.deposit')}
            required
            disabled={depositMode !== 'MANUAL'}
          />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{tp('sellerAuctions.depositMode')}</label>
            <select
              className={styles.filterSelect}
              value={depositMode}
              onChange={(e) => setDepositMode(e.target.value as typeof depositMode)}
            >
              <option value="PERCENT_OF_AUCTION">{tp('sellerAuctions.depositModeAuction')}</option>
              <option value="PERCENT_OF_PRODUCT">{tp('sellerAuctions.depositModeProduct')}</option>
              <option value="MANUAL">{tp('sellerAuctions.depositModeManual')}</option>
            </select>
          </div>

          {depositMode !== 'MANUAL' && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{tp('sellerAuctions.depositPercent')}</label>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={Math.min(20, Math.max(5, Number(depositPercent || 5)))}
                onChange={(e) => setDepositPercent(Number(e.target.value) || 5)}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <input
                className={styles.filterSelect}
                type="number"
                min={5}
                max={20}
                value={depositPercent}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  if (!Number.isFinite(raw)) {
                    setDepositPercent(5);
                    return;
                  }
                  setDepositPercent(Math.min(20, Math.max(5, raw)));
                }}
              />
              <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
                {tp('sellerAuctions.depositHint')}
              </div>
            </div>
          )}
        </div>

        {selectedProduct && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{tp('sellerAuctions.productPriceInfo')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              <div>{tp('sellerAuctions.product')}: <strong>{selectedProduct.name || `${selectedProduct.brand || ''} ${selectedProduct.model || ''}`.trim()}</strong></div>
              <div>{tp('sellerAuctions.productPrice')}: <strong>{formatVND(productValue)}</strong></div>
              <div>{tp('sellerAuctions.auctionStartPrice')}: <strong>{formatVND(formData.startPrice)}</strong></div>
              <div>
                {tp('sellerAuctions.appliedDeposit')}: <strong>{formatVND(depositMode === 'MANUAL' ? formData.depositAmount : computedDepositAmount)}</strong>
              </div>
            </div>
            <div style={{ marginTop: 6, color: '#334155', fontSize: 13 }}>
              {tp('sellerAuctions.safeRange', {
                min: formatVND(suggestedDepositMin),
                max: formatVND(suggestedDepositMax),
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: '0.75rem' }}>
          <Button type="submit" variant="primary" disabled={submitting || eligibleProducts.length === 0}>
            {submitting ? tp('sellerAuctions.creating') : eligibleProducts.length === 0 ? tp('sellerAuctions.noEligibleProduct') : tp('sellerAuctions.createAuction')}
          </Button>
        </div>
      </form>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">{getAuctionStatusLabel('ALL')}</option>
          <option value="UPCOMING">{getAuctionStatusLabel('UPCOMING')}</option>
          <option value="ACTIVE">{getAuctionStatusLabel('ACTIVE')}</option>
          <option value="COMPLETED">{getAuctionStatusLabel('COMPLETED')}</option>
          <option value="CANCELLED">{getAuctionStatusLabel('CANCELLED')}</option>
          <option value="FAILED">{getAuctionStatusLabel('FAILED')}</option>
        </select>
        <input 
          type="text" 
          placeholder={tp('sellerAuctions.searchPlaceholder')} 
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{tp('sellerAuctions.auctionId')}</th>
            <th>{tp('sellerAuctions.auctionProduct')}</th>
            <th>{tp('sellerAuctions.auctionStatus')}</th>
            <th>{tp('sellerAuctions.auctionPrice')}</th>
            <th>{tp('sellerAuctions.auctionEnd')}</th>
            <th>{tp('sellerAuctions.auctionAction')}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{tp('sellerAuctions.loading')}</td></tr>
          ) : filteredAuctions.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{tp('sellerAuctions.empty')}</td></tr>
          ) : (
            filteredAuctions.map(auction => (
              <tr key={auction.id}>
                <td>
                  <span style={{ fontFamily: 'monospace' }}>#{String(auction.id || '').slice(0, 8)}</span>
                </td>
                <td>
                  <strong>{getProductName(auction.productId)}</strong>
                </td>
                <td>
                  <span className={auction.status === 'ACTIVE' ? styles.badgeActive : styles.badgePending}>
                    {getAuctionStatusLabel(auction.status)}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatVND(auction.currentPrice || auction.startPrice)}</div>
                </td>
                <td>{auction.endTime ? new Date(auction.endTime).toLocaleString('vi-VN') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {auction.id && (
                      <Link to={`/auctions/${auction.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="small">{tp('sellerAuctions.viewDetail')}</Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
