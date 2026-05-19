// @ts-nocheck
const menuItems = {
  items: [
    {
      id: 'administration',
      title: 'Administration',
      type: 'group',
      children: [
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
