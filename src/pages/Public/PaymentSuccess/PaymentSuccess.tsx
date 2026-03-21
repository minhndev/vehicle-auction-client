import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';

export const PaymentSuccess: React.FC = () => {
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
        {/* Success Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#dcfce7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 1.5rem',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem' }}>
          Thanh toán thành công!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Giao dịch của bạn đã được xử lý thành công. Chúng tôi sẽ liên hệ với bạn để sắp xếp giao xe.
        </p>

        {ref && (
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '1.5rem' }}>
            Mã giao dịch: <strong>{ref}</strong>
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/user/orders">
            <Button variant="primary">Xem đơn hàng</Button>
          </Link>
          <Link to="/auctions">
            <Button variant="outline">Tiếp tục đấu giá</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
