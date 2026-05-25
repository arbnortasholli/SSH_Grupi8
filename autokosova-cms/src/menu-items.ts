// @ts-nocheck
const menuItems = {
  items: [
    {
      id: 'administration',
      title: 'Administration',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'cars',
          title: 'Cars',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'directions_car',
          url: '/cars'
        },
        {
          id: 'car-features',
          title: 'Car Features',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'tune',
          url: '/car-features'
        },
        {
          id: 'rental-bookings',
          title: 'Rental Bookings',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'event_available',
          url: '/rental-bookings'
        },
        {
          id: 'accounts',
          title: 'Accounts',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'account_circle',
          url: '/accounts'
        },
        {
          id: 'account-roles',
          title: 'Account Roles',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'groups',
          url: '/account-roles'
        },
        {
          id: 'role-permissions',
          title: 'Role Permissions',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'link',
          url: '/role-permissions'
        },
        {
          id: 'tenant-requests',
          title: 'Tenant Requests',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'business_center',
          url: '/tenant-requests'
        },
        {
          id: 'external-car-requests',
          title: 'External Requests',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'request_quote',
          url: '/external-car-requests'
        },
        {
          id: 'buy-car-requests',
          title: 'Buy Car Requests',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'shopping_bag',
          url: '/buy-car-requests'
        },
        {
          id: 'interested-customers',
          title: 'Interested Customers',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'contact_phone',
          url: '/interested-customers'
        },
        {
          id: 'tenants',
          title: 'Tenants',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'storefront',
          url: '/tenants'
        },
        {
          id: 'permissions',
          title: 'Permissions',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'admin_panel_settings',
          url: '/permissions'
        }
      ]
    }
  ]
};

export default menuItems;
