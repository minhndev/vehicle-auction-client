import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button/Button';
import { orderApi } from '../../../api/orderApi';
import type { OrderResponse } from '../../../types/index';
import styles from './CheckoutPage.module.css';

const shippingSchema = z.object({
  recipientName: z.string().min(2, 'Vui lòng nhập tên người nhận (ít nhất 2 ký tự)'),
  recipientPhone: z
    .string()
    .regex(/^(\+84|0)[0-9]{8,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  shippingAddress: z.string().min(10, 'Địa chỉ phải ít nhất 10 ký tự'),
  shippingNote: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const formatVND = (amount?: number | null) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      recipientName: '',
      recipientPhone: '',
      shippingAddress: '',
      shippingNote: '',
    },
  });

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch {
        // Non-critical; order summary optional
      } finally {
        setOrderLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const onSubmit = async (formData: ShippingFormValues) => {
    if (!id) return;
    setSubmitError(null);
    try {
      const result = await orderApi.payOrder(id, formData);
      // API returns paymentUrl or paymentURL (handle both casings)
      const url = result.paymentUrl ?? result.paymentURL;
      if (url) {
        window.location.href = url;
      } else {
        setSubmitError('Không nhận được URL thanh toán từ máy chủ. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSubmitError(axiosErr.response?.data?.message ?? 'Lỗi khi xử lý thanh toán, vui lòng thử lại.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkoutForm}>
        <h1 className={styles.title}>Thanh toán đơn hàng</h1>
        <p className={styles.subtitle}>Vui lòng điền thông tin giao hàng trước khi thanh toán.</p>

        {submitError && <div className={styles.error}>{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label>Tên người nhận *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nguyễn Văn A"
              {...register('recipientName')}
            />
            {errors.recipientName && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.recipientName.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Số điện thoại *</label>
            <input
              type="tel"
              className={styles.input}
              placeholder="0912345678"
              {...register('recipientPhone')}
            />
            {errors.recipientPhone && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.recipientPhone.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Địa chỉ giao hàng *</label>
            <textarea
              className={styles.textarea}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows={3}
              {...register('shippingAddress')}
            />
            {errors.shippingAddress && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.shippingAddress.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Ghi chú (tuỳ chọn)</label>
            <textarea
              className={styles.textarea}
              placeholder="Yêu cầu đặc biệt về giao hàng..."
              rows={2}
              {...register('shippingNote')}
            />
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h3>Tóm tắt đơn hàng</h3>
            {orderLoading ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải...</p>
            ) : order ? (
              <>
                <div className={styles.summaryRow}>
                  <span>Tên xe</span>
                  <span style={{ fontWeight: 600 }}>{order.productName ?? '—'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Giá thắng</span>
                  <span>{formatVND(order.winningPrice)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tiền cọc đã nộp</span>
                  <span>- {formatVND(order.depositAmount)}</span>
                </div>
                <div
                  className={styles.summaryRow}
                  style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}
                >
                  <span style={{ fontWeight: 700 }}>Số tiền cần thanh toán</span>
                  <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '18px' }}>
                    {formatVND(order.remainingAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.summaryRow}>
                <span>Tổng cộng</span>
                <span>Đang xử lý</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-lg)' }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Thanh toán qua VNPay →'}
          </Button>
        </form>
      </div>
    </div>
  );
};
