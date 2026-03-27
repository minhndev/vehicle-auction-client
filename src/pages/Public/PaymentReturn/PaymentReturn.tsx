import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import styles from './PaymentReturn.module.css';

const DEPOSIT_PENDING_AUCTION_ID_KEY = 'deposit.pendingAuctionId';
const DEPOSIT_PAID_AUCTION_KEY_PREFIX = 'deposit.paidAuctionId.';

export const PaymentReturn: React.FC = () => {
  const { tp } = usePageI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState(tp('paymentReturn.verifying'));
  const [depositAuctionId, setDepositAuctionId] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') {
      setMessage(tp('paymentReturn.verifying'));
    }
  }, [status, tp]);

  useEffect(() => {
    verifyPayment();
  }, [location.search]);

  useEffect(() => {
    if (status !== 'success' || !depositAuctionId) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(`/auctions/${depositAuctionId}`);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, depositAuctionId, navigate]);

  const verifyPayment = async () => {
    if (!location.search) {
      setStatus('failed');
      setMessage(tp('paymentReturn.missingInfo'));
      return;
    }

    try {
      const response: any = await miscApi.verifyVnPayReturn(location.search);
      // Depending on API response structure, determine success or failure
      // Usually vnpay returns vnp_ResponseCode=00 in query string if success
      const urlParams = new URLSearchParams(location.search);
      const isSuccess = urlParams.get('vnp_ResponseCode') === '00';
      
      const pendingAuctionId = 
        sessionStorage.getItem(DEPOSIT_PENDING_AUCTION_ID_KEY) || 
        localStorage.getItem(DEPOSIT_PENDING_AUCTION_ID_KEY) || 
        '';

      // Check for auctionId in backend response if available
      const auctionIdFromResponse = 
        response?.auctionId || 
        response?.data?.auctionId || 
        '';
      
      const rawAuctionIdFromQuery =
        urlParams.get('auctionId') ||
        urlParams.get('referenceId') ||
        urlParams.get('ref') ||
        '';
      
      // Heuristic: If it looks like a transaction ID (starts with TXN-), skip it
      const auctionIdFromQuery = (rawAuctionIdFromQuery && !rawAuctionIdFromQuery.startsWith('TXN-')) 
        ? rawAuctionIdFromQuery 
        : '';

      const resolvedAuctionId = pendingAuctionId || auctionIdFromResponse || auctionIdFromQuery;
      
      if (isSuccess || (response && response.status === 'success')) {
        if (resolvedAuctionId) {
          sessionStorage.setItem(`${DEPOSIT_PAID_AUCTION_KEY_PREFIX}${resolvedAuctionId}`, '1');
          localStorage.setItem(`${DEPOSIT_PAID_AUCTION_KEY_PREFIX}${resolvedAuctionId}`, '1');
          setDepositAuctionId(resolvedAuctionId);
        }
        sessionStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
        localStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
        setStatus('success');
        setMessage(tp('paymentReturn.success'));
      } else {
        sessionStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
        localStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
        setStatus('failed');
        setMessage(tp('paymentReturn.failed'));
      }
    } catch (err) {
      // In a real app we might get a 400 from backend if signature fails
      sessionStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
      localStorage.removeItem(DEPOSIT_PENDING_AUCTION_ID_KEY);
      setStatus('failed');
      setMessage(tp('paymentReturn.serverVerifyFailed'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <div className={styles.loadingState}>
            <div className="loadingSpinner" style={{ marginBottom: '1rem' }}>{tp('paymentReturn.processing')}</div>
            <p className={styles.text}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.successState}>
            <div className={styles.iconCircleSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>{tp('paymentReturn.successTitle')}</h2>
            <p className={styles.text}>{message}</p>
            {depositAuctionId ? (
              <p className={styles.text}>{tp('paymentReturn.redirectAuction')}</p>
            ) : (
                <p className={styles.text} style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Hệ thống không xác định được mã phiên đấu giá. Vui lòng quay lại danh sách hoặc trang cá nhân để tiếp tục.
                </p>
            )}
            <div className={styles.actions}>
              {depositAuctionId ? (
                <Button variant="primary" onClick={() => navigate(`/auctions/${depositAuctionId}`)}>{tp('paymentReturn.backToAuction')}</Button>
              ) : (
                <Button variant="primary" onClick={() => navigate('/auctions')}>Xem danh sách đấu giá</Button>
              )}
              <Button variant="outline" onClick={() => navigate('/user/dashboard')}>Trang cá nhân</Button>
              <Button variant="outline" onClick={() => navigate('/user/orders')}>Lịch sử đơn hàng</Button>
            </div>
          </div>
        )}


        {status === 'failed' && (
          <div className={styles.failedState}>
            <div className={styles.iconCircleFailed}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2>{tp('paymentReturn.failedTitle')}</h2>
            <p className={styles.text}>{message}</p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/user/wallet/deposit')}>{tp('paymentReturn.retry')}</Button>
              <Link to="/" className={styles.link}>{tp('paymentReturn.goHome')}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
