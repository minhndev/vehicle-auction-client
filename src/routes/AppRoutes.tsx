import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { SellerLayout } from '../layouts/SellerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { UserLayout } from '../layouts/UserLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm';

// Public Pages
import { Home } from '../pages/Home/Home';
import { About } from '../pages/About/About';
import { AuctionList } from '../pages/AuctionList/AuctionList';
import { AuctionDetail } from '../pages/AuctionDetail/AuctionDetail';
import { PaymentReturn } from '../pages/Public/PaymentReturn/PaymentReturn';
import { PaymentSuccess } from '../pages/Public/PaymentSuccess/PaymentSuccess';
import { PaymentFailed } from '../pages/Public/PaymentFailed/PaymentFailed';
import { VerifyEmail } from '../pages/Public/VerifyEmail/VerifyEmail';
import { OAuth2Redirect } from '../pages/Public/OAuth2Redirect/OAuth2Redirect';

// User Pages
import { UserDashboard } from '../pages/User/Dashboard/UserDashboard';
import { CheckoutPage } from '../pages/User/Orders/CheckoutPage';
import { MyOrders } from '../pages/User/Orders/MyOrders';
import { Watchlist } from '../pages/User/Dashboard/Watchlist';
import { NotificationsPage } from '../pages/User/Notifications/NotificationsPage';
import { MyBids } from '../pages/User/Bids/MyBids';
import { MyProfilePage } from '../pages/User/Profile/MyProfilePage';
import { UpdateProfilePage } from '../pages/User/Profile/UpdateProfilePage';
import { ChangePasswordPage } from '../pages/User/Profile/ChangePasswordPage';

// Placeholder components to verify routing works
const Unauthorized = () => <div><h2>403 - Bạn không có quyền truy cập</h2></div>;
const NotFound = () => <div><h2>404 - Không tìm thấy trang</h2></div>;

// Seller Pages
import { SellerDashboard } from '../pages/Seller/Dashboard/SellerDashboard';
import { SellerAuctions } from '../pages/Seller/Vehicles/SellerAuctions';
import { SellerProducts } from '../pages/Seller/Vehicles/SellerProducts';
import { VehicleRegistrationForm } from '../pages/Seller/Vehicles/VehicleRegistrationForm';
import { VehicleEditForm } from '../pages/Seller/Vehicles/VehicleEditForm';

// Admin Pages
import { AdminDashboard } from '../pages/Admin/Dashboard/AdminDashboard';
import { AdminUsers } from '../pages/Admin/Users/AdminUsers';
import { AdminVehicles } from '../pages/Admin/Vehicles/AdminVehicles';
import { AdminCategories } from '../pages/Admin/Categories/AdminCategories';
import { AdminAuctions } from '../pages/Admin/Auctions/AdminAuctions';
import { AdminRoles } from '../pages/Admin/Roles/AdminRoles';
import { AdminProducts } from '../pages/Admin/Products/AdminProducts';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/payment-return" element={<PaymentReturn />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* User Protected Routes with MainLayout */}
      <Route element={<ProtectedRoute allowedRoles={['USER', 'MEMBER', 'BUYER']} />}>
        <Route element={<MainLayout />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="orders/:id/checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="bids" element={<MyBids />} />
            <Route path="profile" element={<MyProfilePage />} />
            <Route path="profile/edit" element={<UpdateProfilePage />} />
            <Route path="profile/change-password" element={<ChangePasswordPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Sell entry route for authenticated users */}
      <Route element={<ProtectedRoute allowedRoles={['USER', 'MEMBER', 'BUYER', 'SELLER']} />}>
        <Route element={<MainLayout />}>
          <Route path="/sell" element={<VehicleRegistrationForm />} />
          <Route path="/sell/*" element={<Navigate to="/sell" replace />} />
        </Route>
      </Route>

      {/* Seller Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<VehicleRegistrationForm />} />
          <Route path="products/:id/edit" element={<VehicleEditForm />} />
          <Route path="auctions" element={<SellerAuctions />} />
          <Route path="auctions/new" element={<VehicleRegistrationForm />} />
          <Route path="auctions/:id/edit" element={<VehicleEditForm />} />
          <Route path="settings" element={<div>Cài đặt người bán</div>} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="auctions" element={<AdminAuctions />} />
          <Route path="roles" element={<AdminRoles />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
