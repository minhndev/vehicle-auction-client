import React, { useEffect, useState } from 'react';
import { miscApi } from '../../../api/miscApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './WalletHistory.module.css';

interface Deposit {
  id: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  transactionId?: string;
}

export const WalletHistory: React.FC = () => {
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
      setError(getErrorMessage(err, 'Failed to fetch deposit history'));
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
      <h2 className={styles.title}>Deposit History</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className="loadingSpinner" style={{ padding: '2rem' }}></div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr><td colSpan={4} className={styles.empty}>No deposit history found.</td></tr>
              ) : (
                deposits.map(deposit => (
                  <tr key={deposit.id}>
                    <td>{new Date(deposit.createdAt).toLocaleString()}</td>
                    <td>{deposit.transactionId || `#${deposit.id.substring(0,8)}`}</td>
                    <td className={styles.amount}>{formatCurrency(deposit.amount)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[deposit.status.toLowerCase()]}`}>
                        {deposit.status}
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
