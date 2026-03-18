import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import axiosClient from '../../../api/axiosClient';
import styles from './DepositPage.module.css';

export const DepositPage: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedAmounts = [500000, 1000000, 5000000, 10000000];

  const handleDeposit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10000) {
      setError('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Dựa theo Tech Context: Tích hợp VNPay qua /api/payments/create
      const response = await axiosClient.post('/payments/create', {
        amount: numAmount,
        targetType: 'WALLET_DEPOSIT',
        referenceId: crypto.randomUUID(), // Tạo mã tham chiếu tạm thời
      });
      
      // @ts-ignore
      if (response && response.paymentURL) {
        // @ts-ignore
        window.location.href = response.paymentURL;
      } else {
        setError('Không nhận được đường dẫn thanh toán từ Server');
      }
    } catch (err: any) {
      setError('Lỗi khi khởi tạo thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Deposit Funds</h1>
        <p className={styles.subtitle}>Add money to your wallet to participate in live vehicle auctions.</p>

        <div className={styles.quickSelect}>
          {predefinedAmounts.map(preset => (
            <button 
              key={preset}
              className={`${styles.presetBtn} ${Number(amount) === preset ? styles.activePreset : ''}`}
              onClick={() => setAmount(preset.toString())}
            >
              {preset.toLocaleString()} đ
            </button>
          ))}
        </div>

        <div className={styles.inputGroup}>
          <label>Nhập số tiền tùy chỉnh (VNĐ)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: 2000000"
            className={styles.input}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button 
          variant="primary" 
          size="large" 
          onClick={handleDeposit} 
          disabled={loading || !amount}
          style={{ width: '100%', marginTop: 'var(--space-xl)' }}
        >
          {loading ? 'Đang khởi tạo...' : 'Nạp tiền qua VNPay'}
        </Button>
      </div>
    </div>
  );
};
