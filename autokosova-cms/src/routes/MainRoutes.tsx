// @ts-nocheck
import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import ProtectedRoute from 'components/ProtectedRoute';
import { RENTAL_PANEL_ROLES, SUPER_ADMIN_ROLES } from 'config/roleAccess';

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
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          )
        },
        {
          path: '/cars',
          element: (
            <ProtectedRoute allowedRoles={RENTAL_PANEL_ROLES}>
              <CarsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/car-features',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <CarFeaturesPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/rental-bookings',
          element: (
            <ProtectedRoute allowedRoles={RENTAL_PANEL_ROLES}>
              <RentalBookingsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/permissions',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <PermissionsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/account-roles',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <AccountRolesPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/role-permissions',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <AccountRolePermissionsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/accounts',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <AccountsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/tenant-requests',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <TenantRequestsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/external-car-requests',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <ExternalCarRequestsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/interested-customers',
          element: (
            <ProtectedRoute allowedRoles={RENTAL_PANEL_ROLES}>
              <InterestedCustomersPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/tenants',
          element: (
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ROLES}>
              <TenantsPage />
            </ProtectedRoute>
          )
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
