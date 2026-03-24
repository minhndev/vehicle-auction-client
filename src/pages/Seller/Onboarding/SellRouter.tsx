import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { VehicleRegistrationForm } from '../Vehicles/VehicleRegistrationForm';
import { SellerOnboarding } from './SellerOnboarding';

export const SellRouter: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user?.role || '').toUpperCase();

  // If user is a SELLER, render the standard registration form
  if (role === 'SELLER') {
    return <VehicleRegistrationForm />;
  }

  // If user is a USER, BUYER, or MEMBER, render the Onboarding path
  return <SellerOnboarding />;
};
