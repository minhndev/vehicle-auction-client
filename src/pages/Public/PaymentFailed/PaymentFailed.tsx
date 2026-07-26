import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { usePageI18n } from '../../../i18n/usePageI18n';

export const PaymentFailed: React.FC = () => {
  const { tp } = usePageI18n();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        {/* Failed Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#fee2e2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 1.5rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>
          {tp('paymentFailed.title')}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {tp('paymentFailed.description')}
        </p>

        {ref && (
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '1.5rem' }}>
            {tp('paymentFailed.referenceCode')}: <strong>{ref}</strong>
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {sessionStorage.getItem('deposit.pendingAuctionId') && (
            <Link to={`/auctions/${sessionStorage.getItem('deposit.pendingAuctionId')}`}>
              <Button variant="primary">Quay lại phiên đấu giá</Button>
            </Link>
          )}
          <Link to="/user/wallet/deposit">
            <Button variant={sessionStorage.getItem('deposit.pendingAuctionId') ? 'outline' : 'primary'}>{tp('paymentFailed.retryPayment')}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">{tp('paymentFailed.goHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
