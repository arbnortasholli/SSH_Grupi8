// @ts-nocheck
const menuItems = {
  items: [
    {
      id: 'administration',
      title: 'Administration',
      type: 'group',
      children: [
        {
          id: 'cars',
          title: 'Cars',
          type: 'item',
          url: '/cars',
          allowedRoles: ['SuperAdmin', 'Rental', 'Seller']
        },
        {
          id: 'car-features',
          title: 'Car Features',
          type: 'item',
          url: '/car-features',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'rental-bookings',
          title: 'Rental Bookings',
          type: 'item',
          url: '/rental-bookings',
          allowedRoles: ['SuperAdmin', 'Rental']
        },
        {
          id: 'accounts',
          title: 'Accounts',
          type: 'item',
          url: '/accounts',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'account-roles',
          title: 'Account Roles',
          type: 'item',
          url: '/account-roles',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'role-permissions',
          title: 'Role Permissions',
          type: 'item',
          url: '/role-permissions',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'tenant-requests',
          title: 'Tenant Requests',
          type: 'item',
          url: '/tenant-requests',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'external-car-requests',
          title: 'External Requests',
          type: 'item',
          url: '/external-car-requests',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'buy-car-requests',
          title: 'Buy Car Requests',
          type: 'item',
          url: '/buy-car-requests'
        },
        {
          id: 'interested-customers',
          title: 'Buy Car Requests',
          type: 'item',
          url: '/interested-customers',
          allowedRoles: ['SuperAdmin', 'Seller']
        },
        {
          id: 'tenants',
          title: 'Tenants',
          type: 'item',
          url: '/tenants',
          allowedRoles: ['SuperAdmin']
        },
        {
          id: 'permissions',
          title: 'Permissions',
          type: 'item',
          url: '/permissions',
          allowedRoles: ['SuperAdmin']
        }
      ]
    }
  ]
};

export default menuItems;
