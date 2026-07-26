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
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'BANK_TRANSFER'>('VNPAY');
  const [showBankDetails, setShowBankDetails] = useState(false);

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
      if (paymentMethod === 'BANK_TRANSFER') {
        // Just update shipping info, do not hit /pay which creates VNPAY url
        await orderApi.updateCheckoutInfo(id, formData);
        setShowBankDetails(true);
      } else {
        const result = await orderApi.payOrder(id, formData);
        const url = result.paymentUrl ?? result.paymentURL;
        if (url) {
          window.location.href = url;
        } else {
          setSubmitError(tp('checkout.noPaymentUrl'));
        }
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

          <div className="mt-8 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Phương thức thanh toán</h3>
            <div className="space-y-3">
              <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-[#2e3d83] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                 <input type="radio" className="mt-1 w-4 h-4 text-[#2e3d83] focus:ring-[#2e3d83]" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                 <div className="ml-3 flex-1">
                    <span className="block text-sm font-bold text-slate-800">Thanh toán Online qua VNPAY</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Thanh toán bằng thẻ qua cổng VNPay (Phù hợp giao dịch &lt; 500 triệu)</span>
                 </div>
              </label>

              <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#2e3d83] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                 <input type="radio" className="mt-1 w-4 h-4 text-[#2e3d83] focus:ring-[#2e3d83]" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} />
                 <div className="ml-3 flex-1">
                    <span className="block text-sm font-bold text-slate-800">Chuyển khoản Ngân hàng (Tiền mặt)</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Dành cho các đơn hàng giá trị lớn hoặc hạn mức VNPAY không đủ</span>
                 </div>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting}
            className="w-full mt-4 h-14 text-lg"
          >
            {isSubmitting ? tp('checkout.processing') : (paymentMethod === 'VNPAY' ? tp('checkout.payWithVnpay') : 'XÁC NHẬN & XEM THÔNG TIN CHUYỂN KHOẢN')}
          </Button>
        </form>
      </div>

      {showBankDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-blue-50 text-[#2e3d83] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h3 className="text-2xl font-black text-center text-slate-800 mb-2">Thanh Toán Chuyển Khoản</h3>
                <p className="text-center text-slate-500 text-sm">Vui lòng chuyển khoản số tiền <strong className="text-red-500 text-base">{formatVND(order?.remainingAmount)}</strong> theo thông tin sau:</p>
             </div>
             <div className="p-8 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                   <span className="text-sm font-bold text-slate-500">Ngân hàng</span>
                   <span className="font-extrabold text-slate-800">Vietcombank (VCB)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                   <span className="text-sm font-bold text-slate-500">Chủ tài khoản</span>
                   <span className="font-extrabold text-slate-800 uppercase">CTY DAU GIA HOP DANH</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                   <span className="text-sm font-bold text-slate-500">Số tài khoản</span>
                   <span className="font-black text-blue-600 text-lg">012345678999</span>
                </div>
                <div className="flex justify-between items-start pt-1">
                   <span className="text-sm font-bold text-slate-500">Nội dung CK</span>
                   <span className="font-bold text-slate-800 text-right bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                     TTXE {order?.productName?.substring(0, 10).toUpperCase() || id?.substring(0, 6)} {order?.id?.substring(0,4)}
                   </span>
                </div>
             </div>
             <div className="p-6 bg-white border-t border-slate-100">
               <button onClick={() => window.location.href = '/user/orders'} className="w-full bg-[#2e3d83] hover:bg-[#1f2f6d] active:scale-[0.98] transition-all text-white font-black text-lg h-14 rounded-2xl uppercase shadow-lg">
                 Đã Hiểu & Về Danh Sách Đơn
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
