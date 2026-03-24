import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { paymentApi } from '../../../api/paymentApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { WalletHistory } from './WalletHistory';
import type { DepositRequest } from '../../../types/index';
import styles from './DepositPage.module.css';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

const PRESET_AMOUNTS = [500_000, 1_000_000, 5_000_000, 10_000_000, 50_000_000];

export const DepositPage: React.FC = () => {
  const { tp } = usePageI18n();
  const [auctionId, setAuctionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  /**
   * Per FRONTEND_INTEGRATION.md §9:
   * POST /deposits { auctionId, paymentMethod: "VNPAY" }
   * → returns { paymentUrl } → redirect to VNPay
   *
   * NOTE: There is NO general wallet top-up endpoint in the spec.
   * The deposit is tied to a specific auction (entry fee).
   * We ask the user for their auction ID here.
   */
  const handleDeposit = async () => {
    if (!auctionId.trim()) {
      setError(tp('deposit.auctionIdRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const payload: DepositRequest = {
        auctionId: auctionId.trim(),
        paymentMethod: 'VNPAY',
      };

      const response: any = await paymentApi.createDepositPayment(payload);
      const url = response?.paymentUrl || response?.paymentURL;

      if (url) {
        window.location.href = url;
      } else {
        setError(tp('deposit.noPaymentUrl'));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? tp('deposit.initError');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{tp('deposit.title')}</h1>
        <p className={styles.subtitle}>
          {tp('deposit.subtitle')}
        </p>

        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
          <label>{tp('deposit.auctionId')} *</label>
          <input
            type="text"
            value={auctionId}
            onChange={(e) => { setAuctionId(e.target.value); setError(null); }}
            placeholder={tp('deposit.auctionIdPlaceholder')}
            className={styles.input}
          />
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            {tp('deposit.auctionIdHint')}
          </p>
        </div>

        {/* Preset quick amounts (informational only) */}
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            {tp('deposit.commonAmounts')}:
          </p>
          <div className={styles.quickSelect}>
            {PRESET_AMOUNTS.map((p) => (
              <span key={p} className={styles.presetBtn} style={{ cursor: 'default' }}>
                {formatVND(p)}
              </span>
            ))}
          </div>
        </div>

        {error && <p className={styles.error} style={{ marginTop: '1rem' }}>{error}</p>}
        {info && <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '1rem' }}>{info}</p>}

        <Button
          variant="primary"
          size="large"
          onClick={handleDeposit}
          disabled={loading || !auctionId.trim()}
          style={{ width: '100%', marginTop: 'var(--space-xl)' }}
        >
          {loading ? tp('deposit.initializing') : tp('deposit.payWithVnpay')}
        </Button>
      </div>

      <WalletHistory />
    </div>
  );
};
