import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import type { AuctionRequest, AuctionResponse, ProductResponse } from '../../../types/index';
import styles from './SellerAuctions.module.css';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerAuctions: React.FC = () => {
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
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu seller');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'N/A';
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
      setError('Vui lòng chọn product đã được duyệt để tạo phiên đấu giá.');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc.');
      return;
    }

    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }

    const effectiveDeposit = depositMode === 'MANUAL' ? Number(formData.depositAmount) : computedDepositAmount;
    if (!Number.isFinite(effectiveDeposit) || effectiveDeposit <= 0) {
      setError('Tiền đặt cọc phải lớn hơn 0.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await auctionApi.createAuction({
        productId: formData.productId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
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
      setError(err?.response?.data?.message || err.message || 'Không thể tạo phiên đấu giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className={styles.badgePending}>Sắp Bắt Đầu</span>;
      case 'ACTIVE':
        return <span className={styles.badgeActive}>Đang Đấu Giá</span>;
      case 'COMPLETED':
        return <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Hoàn Thành</span>;
      case 'CANCELLED':
        return <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Đã Huỷ</span>;
      case 'FAILED':
        return <span style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Thất Bại</span>;
      default:
        return <span className={styles.badgePending}>{status || 'N/A'}</span>;
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
        <h1 className={styles.title}>Quản Lý Auction</h1>
        <Link to="/seller/products" style={{ textDecoration: 'none' }}>
           <Button variant="outline">Mở Trang Product</Button>
        </Link>
      </div>

      <form onSubmit={handleCreateAuction} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Tạo phiên đấu giá mới</h3>
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
            <option value="">-- Chọn product đã duyệt --</option>
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
            placeholder="Giá khởi điểm"
            required
          />

          <input
            className={styles.filterSelect}
            type="number"
            min={1000}
            value={formData.bidIncrement || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, bidIncrement: Number(e.target.value) }))}
            placeholder="Bước giá"
            required
          />

          <input
            className={styles.filterSelect}
            type="number"
            min={0}
            value={depositMode === 'MANUAL' ? formData.depositAmount || '' : computedDepositAmount || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, depositAmount: Number(e.target.value) }))}
            placeholder="Tiền cọc"
            required
            disabled={depositMode !== 'MANUAL'}
          />
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Cách tính tiền cọc</label>
            <select
              className={styles.filterSelect}
              value={depositMode}
              onChange={(e) => setDepositMode(e.target.value as typeof depositMode)}
            >
              <option value="PERCENT_OF_AUCTION">% của giá khởi điểm phiên</option>
              <option value="PERCENT_OF_PRODUCT">% của giá trị product</option>
              <option value="MANUAL">Nhập tay tiền cọc</option>
            </select>
          </div>

          {depositMode !== 'MANUAL' && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Tỷ lệ đặt cọc (%)</label>
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
                Kéo nhanh trong dải khuyến nghị 5%-20%.
              </div>
            </div>
          )}
        </div>

        {selectedProduct && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin giá của product</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              <div>Product: <strong>{selectedProduct.name || `${selectedProduct.brand || ''} ${selectedProduct.model || ''}`.trim()}</strong></div>
              <div>Giá product hiện tại: <strong>{formatVND(productValue)}</strong></div>
              <div>Giá khởi điểm phiên: <strong>{formatVND(formData.startPrice)}</strong></div>
              <div>
                Tiền cọc áp dụng: <strong>{formatVND(depositMode === 'MANUAL' ? formData.depositAmount : computedDepositAmount)}</strong>
              </div>
            </div>
            <div style={{ marginTop: 6, color: '#334155', fontSize: 13 }}>
              Gợi ý an toàn: tiền cọc thường nằm trong khoảng <strong>{formatVND(suggestedDepositMin)}</strong> đến <strong>{formatVND(suggestedDepositMax)}</strong> (5%-20% theo mức giá cơ sở).
            </div>
          </div>
        )}

        <div style={{ marginTop: '0.75rem' }}>
          <Button type="submit" variant="primary" disabled={submitting || eligibleProducts.length === 0}>
            {submitting ? 'Đang tạo...' : eligibleProducts.length === 0 ? 'Không có product đủ điều kiện' : 'Tạo auction'}
          </Button>
        </div>
      </form>

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <input 
          type="text" 
          placeholder="Tìm theo tên product..." 
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã Auction</th>
            <th>Product</th>
            <th>Trạng Thái</th>
            <th>Giá Hiện Tại</th>
            <th>Kết Thúc</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td></tr>
          ) : filteredAuctions.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy auction nào.</td></tr>
          ) : (
            filteredAuctions.map(auction => (
              <tr key={auction.id}>
                <td>
                  <span style={{ fontFamily: 'monospace' }}>#{String(auction.id || '').slice(0, 8)}</span>
                </td>
                <td>
                  <strong>{getProductName(auction.productId)}</strong>
                </td>
                <td>{getStatusBadge(auction.status)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatVND(auction.currentPrice || auction.startPrice)}</div>
                </td>
                <td>{auction.endTime ? new Date(auction.endTime).toLocaleString('vi-VN') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {auction.id && (
                      <Link to={`/auctions/${auction.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="small">Xem chi tiết</Button>
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
