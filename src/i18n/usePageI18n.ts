import { useTranslation } from 'react-i18next';

export const usePageI18n = () => {
  const { t } = useTranslation('pages');

  const translateStatus = (group: 'auctionStatus' | 'productStatus' | 'userStatus' | 'orderStatus', status?: string) => {
    if (!status) {
      return t('shared.status.unknown');
    }

    const normalized = String(status).toUpperCase();
    return t(`shared.${group}.${normalized}`, {
      defaultValue: status,
    });
  };

  const getWalletStatusLabel = (status?: string) => {
    if (!status) {
      return t('walletHistory.statusValue.PENDING');
    }

    return t(`walletHistory.statusValue.${String(status).toUpperCase()}`, {
      defaultValue: status,
    });
  };

  const getAuctionStatusLabel = (status?: string) => {
    return translateStatus('auctionStatus', status);
  };

  const getProductStatusLabel = (status?: string) => {
    return translateStatus('productStatus', status);
  };

  const getUserStatusLabel = (status?: string) => {
    return translateStatus('userStatus', status);
  };

  const getOrderStatusLabel = (status?: string) => {
    return translateStatus('orderStatus', status);
  };

  return {
    tp: t,
    getWalletStatusLabel,
    getAuctionStatusLabel,
    getProductStatusLabel,
    getUserStatusLabel,
    getOrderStatusLabel,
  };
};
