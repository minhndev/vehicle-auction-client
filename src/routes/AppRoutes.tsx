import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { SellerLayout } from '../layouts/SellerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm';

// Public Pages
import { Home } from '../pages/Home/Home';

// Placeholder components to verify routing works
const Unauthorized = () => <div><h2>403 - Unauthorized Access</h2></div>;
const NotFound = () => <div><h2>404 - Page Not Found</h2></div>;

// Seller placeholders
const SellerDashboard = () => <div><h2>Seller Dashboard</h2></div>;
const SellerAuctions = () => <div><h2>My Auctions</h2><p>List of seller's vehicles.</p></div>;

// Admin placeholders
const AdminDashboard = () => <div><h2>Admin Dashboard</h2></div>;
const AdminUsers = () => <div><h2>Manage Users</h2></div>;

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Seller Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="auctions" element={<SellerAuctions />} />
          <Route path="settings" element={<div>Seller Settings</div>} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="auctions" element={<div>Admin Moderate Auctions</div>} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
