import type { AuthUser } from 'types/auth';

export const CMS_ACCESS_ROLES = ['SuperAdmin', 'Rental', 'Seller'] as const;
export const SUPER_ADMIN_ROLES = ['SuperAdmin'] as const;
export const RENTAL_PANEL_ROLES = ['SuperAdmin', 'Rental', 'Seller'] as const;

export const normalizeRole = (role?: string | null): string => {
  if (!role) {
    return '';
  }

  return role === 'Seller' ? 'Rental' : role;
};

export const hasAllowedRole = (user: AuthUser | null, allowedRoles?: readonly string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const normalizedRole = normalizeRole(user?.role);
  return allowedRoles.some((role) => normalizeRole(role) === normalizedRole);
};

export const getDefaultCmsPath = (user: AuthUser | null): string => {
  const normalizedRole = normalizeRole(user?.role);

  if (normalizedRole === 'SuperAdmin') {
    return '/dashboard/sales';
  }

  if (normalizedRole === 'Rental') {
    return '/cars';
  }

  return '/login';
};
