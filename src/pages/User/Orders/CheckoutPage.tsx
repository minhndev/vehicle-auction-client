import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button/Button';
import { orderApi } from '../../../api/orderApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { OrderResponse } from '../../../types/index';
import styles from './CheckoutPage.module.css';

type ShippingFormValues = {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingNote?: string;
};

const formatVND = (amount?: number | null) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CheckoutPage: React.FC = () => {
  const { tp } = usePageI18n();
  const { id } = useParams<{ id: string }>();

  const shippingSchema = z.object({
    recipientName: z.string().min(2, tp('checkout.validationRecipientName')),
    recipientPhone: z
      .string()
      .regex(/^(\+84|0)[0-9]{8,10}$/, tp('checkout.validationRecipientPhone')),
    shippingAddress: z.string().min(10, tp('checkout.validationAddress')),
    shippingNote: z.string().optional(),
  });

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
        setSubmitError(tp('checkout.noPaymentUrl'));
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSubmitError(axiosErr.response?.data?.message ?? tp('checkout.payError'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkoutForm}>
        <h1 className={styles.title}>{tp('checkout.title')}</h1>
        <p className={styles.subtitle}>{tp('checkout.subtitle')}</p>

        {submitError && <div className={styles.error}>{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label>{tp('checkout.recipientName')} *</label>
            <input
              type="text"
              className={styles.input}
              placeholder={tp('checkout.recipientNamePlaceholder')}
              {...register('recipientName')}
            />
            {errors.recipientName && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.recipientName.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{tp('checkout.recipientPhone')} *</label>
            <input
              type="tel"
              className={styles.input}
              placeholder={tp('checkout.recipientPhonePlaceholder')}
              {...register('recipientPhone')}
            />
            {errors.recipientPhone && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.recipientPhone.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{tp('checkout.shippingAddress')} *</label>
            <textarea
              className={styles.textarea}
              placeholder={tp('checkout.shippingAddressPlaceholder')}
              rows={3}
              {...register('shippingAddress')}
            />
            {errors.shippingAddress && (
              <span style={{ color: '#dc2626', fontSize: '13px' }}>{errors.shippingAddress.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{tp('checkout.shippingNote')}</label>
            <textarea
              className={styles.textarea}
              placeholder={tp('checkout.shippingNotePlaceholder')}
              rows={2}
              {...register('shippingNote')}
            />
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h3>{tp('checkout.summaryTitle')}</h3>
            {orderLoading ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{tp('checkout.loading')}</p>
            ) : order ? (
              <>
                <div className={styles.summaryRow}>
                  <span>{tp('checkout.vehicleName')}</span>
                  <span style={{ fontWeight: 600 }}>{order.productName ?? tp('checkout.notAvailable')}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{tp('checkout.winningPrice')}</span>
                  <span>{formatVND(order.winningPrice)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{tp('checkout.depositPaid')}</span>
                  <span>- {formatVND(order.depositAmount)}</span>
                </div>
                <div
                  className={styles.summaryRow}
                  style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}
                >
                  <span style={{ fontWeight: 700 }}>{tp('checkout.totalPayment')}</span>
                  <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '18px' }}>
                    {formatVND(order.remainingAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.summaryRow}>
                <span>{tp('checkout.total')}</span>
                <span>{tp('checkout.processing')}</span>
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
            {isSubmitting ? tp('checkout.processing') : tp('checkout.payWithVnpay')}
          </Button>
        </form>
      </div>
    </div>
  );
};
