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
