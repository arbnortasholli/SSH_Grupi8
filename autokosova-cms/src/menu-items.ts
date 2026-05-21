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
