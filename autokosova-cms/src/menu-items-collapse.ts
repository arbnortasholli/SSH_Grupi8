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
          url: '/cars'
        },
        {
          id: 'car-features',
          title: 'Car Features',
          type: 'item',
          url: '/car-features'
        },
        {
          id: 'accounts',
          title: 'Accounts',
          type: 'item',
          url: '/accounts'
        },
        {
          id: 'account-roles',
          title: 'Account Roles',
          type: 'item',
          url: '/account-roles'
        },
        {
          id: 'role-permissions',
          title: 'Role Permissions',
          type: 'item',
          url: '/role-permissions'
        },
        {
          id: 'permissions',
          title: 'Permissions',
          type: 'item',
          url: '/permissions'
        }
      ]
    }
  ]
};

export default menuItems;
