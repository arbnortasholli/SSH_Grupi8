import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { HomePage } from '../pages/HomePage';
import { BuyCarsPage } from '../pages/BuyCarsPage';
import { RentCarsPage } from '../pages/RentCarsPage';
import { KoreanCarsPage } from '../pages/KoreanCarsPage';
import { ImportRequestsPage } from '../pages/ImportRequestsPage';
import { CreateCarPage } from '../pages/CreateCarPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CarDetailsPage } from '../pages/CarDetailsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { EditCarPage } from '../pages/EditCarPage';
import { TenantRequestPage } from '../pages/TenantRequestPage';
import { PaymentStatusPage } from '../pages/PaymentStatusPage';

export const AppRoutes: React.FC = () => (
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/buy" element={<MainLayout><BuyCarsPage /></MainLayout>} />
        <Route path="/rent" element={<MainLayout><RentCarsPage /></MainLayout>} />
        <Route path="/korean-cars" element={<MainLayout><KoreanCarsPage /></MainLayout>} />
        <Route
          path="/import-requests"
          element={<ProtectedRoute><MainLayout><ImportRequestsPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/create-car"
          element={
            <ProtectedRoute requiredRoles={['Rental', 'SuperAdmin']}>
              <MainLayout><CreateCarPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/rent-your-car" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
        <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
        <Route path="/cars/:id" element={<MainLayout><CarDetailsPage /></MainLayout>} />
        <Route
          path="/payment-status"
          element={<ProtectedRoute><MainLayout><PaymentStatusPage /></MainLayout></ProtectedRoute>}
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/favorites"
          element={<ProtectedRoute><MainLayout><FavoritesPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/tenant-request"
          element={<ProtectedRoute><MainLayout><TenantRequestPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/seller"
          element={
            <ProtectedRoute requiredRoles={['Rental', 'SuperAdmin']}>
              <MainLayout><SellerDashboardPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/add-car"
          element={
            <ProtectedRoute requiredRoles={['Rental', 'SuperAdmin']}>
              <MainLayout><CreateCarPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/edit-car/:id"
          element={
            <ProtectedRoute requiredRoles={['Rental', 'SuperAdmin']}>
              <MainLayout><EditCarPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
);
