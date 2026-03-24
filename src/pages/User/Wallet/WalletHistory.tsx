import React, { useEffect, useState } from 'react';
import { miscApi } from '../../../api/miscApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import { usePageI18n } from '../../../i18n/usePageI18n';
import styles from './WalletHistory.module.css';

interface Deposit {
  id: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  transactionId?: string;
}

export const WalletHistory: React.FC = () => {
  const { tp, getWalletStatusLabel } = usePageI18n();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await miscApi.getDeposits();
      if (Array.isArray(res)) setDeposits(res);
      else if (res?.content) setDeposits(res.content);
    } catch (err) {
      setError(getErrorMessage(err, tp('walletHistory.fetchError')));
      // Fallback data for mockup if API not implemented
      setDeposits([
        { id: '1', amount: 500000, status: 'SUCCESS', createdAt: new Date().toISOString(), transactionId: 'VN123456' },
        { id: '2', amount: 150000, status: 'FAILED', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{tp('walletHistory.title')}</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className="loadingSpinner" style={{ padding: '2rem' }}></div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tp('walletHistory.date')}</th>
                <th>{tp('walletHistory.transactionId')}</th>
                <th>{tp('walletHistory.amount')}</th>
                <th>{tp('walletHistory.status')}</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr><td colSpan={4} className={styles.empty}>{tp('walletHistory.empty')}</td></tr>
              ) : (
                deposits.map(deposit => (
                  <tr key={deposit.id}>
                    <td>{new Date(deposit.createdAt).toLocaleString()}</td>
                    <td>{deposit.transactionId || `#${deposit.id.substring(0,8)}`}</td>
                    <td className={styles.amount}>{formatCurrency(deposit.amount)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[deposit.status.toLowerCase()]}`}>
                        {getWalletStatusLabel(deposit.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
