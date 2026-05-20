// @ts-nocheck
import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const AdminDashboard = lazy(() => import('../views/dashboard/AdminDashboard'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));
const PermissionsPage = lazy(() => import('../views/permissions/PermissionsPage'));
const AccountRolesPage = lazy(() => import('../views/account-roles/AccountRolesPage'));
const AccountsPage = lazy(() => import('../views/accounts/AccountsPage'));
const AccountRolePermissionsPage = lazy(() => import('../views/account-role-permissions/AccountRolePermissionsPage'));
const CarsPage = lazy(() => import('../views/cars/CarsPage'));
const CarFeaturesPage = lazy(() => import('../views/car-features/CarFeaturesPage'));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AdminLayout />,
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
