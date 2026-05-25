// @ts-nocheck
import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import ProtectedRoute from 'components/ProtectedRoute';

const AdminDashboard = lazy(() => import('../views/dashboard/AdminDashboard'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));
const PermissionsPage = lazy(() => import('../views/permissions/PermissionsPage'));
const AccountRolesPage = lazy(() => import('../views/account-roles/AccountRolesPage'));
const AccountsPage = lazy(() => import('../views/accounts/AccountsPage'));
const AccountRolePermissionsPage = lazy(() => import('../views/account-role-permissions/AccountRolePermissionsPage'));
const CarsPage = lazy(() => import('../views/cars/CarsPage'));
const CarFeaturesPage = lazy(() => import('../views/car-features/CarFeaturesPage'));
const RentalBookingsPage = lazy(() => import('../views/rental-bookings/RentalBookingsPage'));
const TenantRequestsPage = lazy(() => import('../views/tenant-requests/TenantRequestsPage'));
const ExternalCarRequestsPage = lazy(() => import('../views/external-car-requests/ExternalCarRequestsPage'));
const BuyCarRequestsPage = lazy(() => import('../views/buy-car-requests/BuyCarRequestsPage'));
const InterestedCustomersPage = lazy(() => import('../views/interested-customers/InterestedCustomersPage'));
const TenantsPage = lazy(() => import('../views/tenants/TenantsPage'));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/dashboard/sales',
          element: <AdminDashboard />
        },
        {
          path: '/cars',
          element: <CarsPage />
        },
        {
          path: '/car-features',
          element: <CarFeaturesPage />
        },
        {
          path: '/rental-bookings',
          element: <RentalBookingsPage />
        },
        {
          path: '/permissions',
          element: <PermissionsPage />
        },
        {
          path: '/account-roles',
          element: <AccountRolesPage />
        },
        {
          path: '/role-permissions',
          element: <AccountRolePermissionsPage />
        },
        {
          path: '/accounts',
          element: <AccountsPage />
        },
        {
          path: '/tenant-requests',
          element: <TenantRequestsPage />
        },
        {
          path: '/external-car-requests',
          element: <ExternalCarRequestsPage />
        },
        {
          path: '/buy-car-requests',
          element: <BuyCarRequestsPage />
        },
        {
          path: '/interested-customers',
          element: <InterestedCustomersPage />
        },
        {
          path: '/tenants',
          element: <TenantsPage />
        },
        {
          path: '*',
          element: <PermissionsPage />
        }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;
