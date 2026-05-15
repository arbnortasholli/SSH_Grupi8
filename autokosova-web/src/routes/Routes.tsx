import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { HomePage } from '../pages/HomePage';
import { BuyCarsPage } from '../pages/BuyCarsPage';
import { RentCarsPage } from '../pages/RentCarsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CarDetailsPage } from '../pages/CarDetailsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';

export const AppRoutes: React.FC = () => (
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/buy" element={<MainLayout><BuyCarsPage /></MainLayout>} />
        <Route path="/rent" element={<MainLayout><RentCarsPage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
        <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
        <Route path="/cars/:id" element={<MainLayout><CarDetailsPage /></MainLayout>} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/favorites"
          element={<ProtectedRoute><MainLayout><FavoritesPage /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/seller"
          element={
            <ProtectedRoute requiredRoles={['Seller', 'Admin']}>
              <MainLayout><SellerDashboardPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
);
