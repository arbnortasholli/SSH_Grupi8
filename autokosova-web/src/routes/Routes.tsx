import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Pages
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CarDetailsPage } from '../pages/CarDetailsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';

export const AppRoutes: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/"
                        element={
                            <MainLayout>
                                <HomePage />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <MainLayout>
                                <LoginPage />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <MainLayout>
                                <RegisterPage />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/cars/:id"
                        element={
                            <MainLayout>
                                <CarDetailsPage />
                            </MainLayout>
                        }
                    />

                    {/* Protected Routes - User */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <DashboardPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <FavoritesPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes - Seller */}
                    <Route
                        path="/seller"
                        element={
                            <ProtectedRoute requiredRoles={['Seller', 'Admin']}>
                                <MainLayout>
                                    <SellerDashboardPage />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};
