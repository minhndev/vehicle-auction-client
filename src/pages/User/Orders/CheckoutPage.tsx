import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import axiosClient from '../../../api/axiosClient';
import styles from './CheckoutPage.module.css';

export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    shippingNote: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      // Dựa theo FRONTEND_PLAN.md: Gọi API POST /orders/{id}/pay
      // Có thể backend yêu cầu truyền shippingInfo trong body
      const response = await axiosClient.post(`/orders/${id}/pay`, shippingInfo);
      
      // @ts-ignore
      if (response && response.paymentURL) {
        // @ts-ignore
        window.location.href = response.paymentURL;
      } else {
        setError('Không nhận được URL thanh toán từ máy chủ.');
      }
    } catch (err: any) {
      setError('Lỗi thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkoutForm}>
        <h1 className={styles.title}>Checkout Order</h1>
        <p className={styles.subtitle}>Please provide shipping information before completing the payment.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleCheckout}>
          <div className={styles.formGroup}>
            <label>Recipient Name *</label>
            <input 
              type="text" 
              name="recipientName"
              required 
              value={shippingInfo.recipientName}
              onChange={handleChange}
              placeholder="Full name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number *</label>
            <input 
              type="tel" 
              name="recipientPhone"
              required 
              value={shippingInfo.recipientPhone}
              onChange={handleChange}
              placeholder="e.g. 0912345678"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Shipping Address *</label>
            <textarea 
              name="shippingAddress"
              required 
              value={shippingInfo.shippingAddress}
              onChange={handleChange}
              placeholder="Full detailed address"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Order Note (Optional)</label>
            <textarea 
              name="shippingNote"
              value={shippingInfo.shippingNote}
              onChange={handleChange}
              placeholder="Any special instructions?"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Pending</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-lg)' }}
          >
            {loading ? 'Processing...' : 'Proceed to Payment (VNPay)'}
          </Button>
        </form>
      </div>
    </div>
  );
};
