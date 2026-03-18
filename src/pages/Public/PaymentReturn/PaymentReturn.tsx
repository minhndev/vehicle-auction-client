import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import styles from './PaymentReturn.module.css';

export const PaymentReturn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment status...');

  useEffect(() => {
    verifyPayment();
  }, [location.search]);

  const verifyPayment = async () => {
    if (!location.search) {
      setStatus('failed');
      setMessage('No payment information provided in the URL.');
      return;
    }

    try {
      const response = await miscApi.verifyVnPayReturn(location.search);
      // Depending on API response structure, determine success or failure
      // Usually vnpay returns vnp_ResponseCode=00 in query string if success
      const urlParams = new URLSearchParams(location.search);
      const isSuccess = urlParams.get('vnp_ResponseCode') === '00';
      
      if (isSuccess || (response && response.status === 'success')) {
        setStatus('success');
        setMessage('Your payment was processed successfully!');
      } else {
        setStatus('failed');
        setMessage('Payment failed or was cancelled.');
      }
    } catch (err) {
      // In a real app we might get a 400 from backend if signature fails
      setStatus('failed');
      setMessage('Failed to verify payment with the server. Please check your wallet order history.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <div className={styles.loadingState}>
            <div className="loadingSpinner" style={{ marginBottom: '1rem' }}>Processing Payment...</div>
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
            <h2>Payment Successful!</h2>
            <p className={styles.text}>{message}</p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/user/wallet/deposit')}>View Wallet</Button>
              <Button variant="outline" onClick={() => navigate('/user/orders')}>View Orders</Button>
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
            <h2>Payment Failed</h2>
            <p className={styles.text}>{message}</p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => navigate('/user/wallet/deposit')}>Try Again</Button>
              <Link to="/" className={styles.link}>Return to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
