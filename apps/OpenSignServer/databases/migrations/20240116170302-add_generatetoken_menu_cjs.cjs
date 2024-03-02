/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'w_menu';
  const userMenu = new Parse.Query(className);
  const updateUserMenu = await userMenu.get('H9vRfEYKhT');
  updateUserMenu.set('menuItems', [
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Dashboard',
      target: '',
      pageType: 'dashboard',
      description: '',
      objectId: '35KBoSgoAK',
    },
    {
      icon: 'far fa-newspaper',
      title: 'New Document',
      target: '_self',
      pageType: null,
      description: null,
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-nib',
          title: 'Sign yourself',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'sHAnZphf69',
        },
        {
          icon: 'fa-solid fa-paper-plane',
          title: 'Request signatures',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: '8mZzFxbG1z',
        },
        {
          icon: 'fas fa-file-signature',
          title: 'New template',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'template',
        },
      ],
    },
    {
      icon: 'fa-solid fa-file-contract',
      title: 'Templates',
      target: '_self',
      pageType: 'report',
      description: '',
      objectId: '6TeaPr321t',
    },
    {
      icon: 'fas fa-folder',
      title: 'OpenSign™ Drive',
      target: '_self',
      pageType: 'mf',
      description: '',
      objectId:
        'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive',
    },
    {
      icon: 'fas fa-address-card',
      title: 'Reports',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-signature',
          title: 'Need your sign',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '4Hhwbp482K',
        },
        {
          icon: 'fas fa-tasks',
          title: 'In Progress',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '1MwEuxLEkF',
        },
        {
          icon: 'fas fa-check-circle',
          title: 'Completed',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'kQUoW4hUXz',
        },
        {
          icon: 'fas fa-edit',
          title: 'Drafts',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'ByHuevtCFY',
        },
        {
          icon: 'fas fa-times-circle',
          title: 'Declined',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'UPr2Fm5WY3',
        },
        {
          icon: 'fas fa-hourglass-end',
          title: 'Expired',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'zNqBHXHsYH',
        },
        {
          icon: 'fa-solid fa-address-book',
          title: 'Contactbook',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '5KhaPr482K',
        },
      ],
    },
    {
      icon: 'fas fa-cog',
      title: 'Settings',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-fancy',
          title: 'My Signature',
          target: '_self',
          pageType: 'mf',
          description: '',
          objectId:
            'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/managesign',
        },
        {
          icon: 'fa-solid fa-key',
          title: 'API Token',
          target: '_self',
          pageType: 'generatetoken',
          description: '',
          objectId: '',
        },
      ],
    },
  ]);

  const AdminMenu = new Parse.Query(className);
  const updateAdminMenu = await AdminMenu.get('VPh91h0ZHk');
  updateAdminMenu.set('menuItems', [
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Dashboard',
      target: '',
      pageType: 'dashboard',
      description: '',
      objectId: '35KBoSgoAK',
    },
    {
      icon: 'far fa-newspaper',
      title: 'New Document',
      target: '_self',
      pageType: null,
      description: null,
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-nib',
          title: 'Sign yourself',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'sHAnZphf69',
        },
        {
          icon: 'fa-solid fa-paper-plane',
          title: 'Request signatures',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: '8mZzFxbG1z',
        },
        {
          icon: 'fas fa-file-signature',
          title: 'New template',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'template',
        },
      ],
    },
    {
      icon: 'fa-solid fa-file-contract',
      title: 'Templates',
      target: '_self',
      pageType: 'report',
      description: '',
      objectId: '6TeaPr321t',
    },
    {
      icon: 'fas fa-folder',
      title: 'OpenSign™ Drive',
      target: '_self',
      pageType: 'mf',
      description: '',
      objectId:
        'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive',
    },
    {
      icon: 'fas fa-address-card',
      title: 'Reports',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-signature',
          title: 'Need your sign',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '4Hhwbp482K',
        },
        {
          icon: 'fas fa-tasks',
          title: 'In Progress',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '1MwEuxLEkF',
        },
        {
          icon: 'fas fa-check-circle',
          title: 'Completed',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'kQUoW4hUXz',
        },
        {
          icon: 'fas fa-edit',
          title: 'Drafts',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'ByHuevtCFY',
        },
        {
          icon: 'fas fa-times-circle',
          title: 'Declined',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'UPr2Fm5WY3',
        },
        {
          icon: 'fas fa-hourglass-end',
          title: 'Expired',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'zNqBHXHsYH',
        },
        {
          icon: 'fa-solid fa-address-book',
          title: 'Contactbook',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '5KhaPr482K',
        },
      ],
    },
    {
      icon: 'fas fa-cog',
      title: 'Settings',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-fancy',
          title: 'My Signature',
          target: '_self',
          pageType: 'mf',
          description: '',
          objectId:
            'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/managesign',
        },
        {
          icon: 'far fa-user',
          title: 'Add User',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'lM0xRnM3iE',
        },
        {
          icon: 'fa-solid fa-key',
          title: 'API Token',
          target: '_self',
          pageType: 'generatetoken',
          description: '',
          objectId: '',
        },
      ],
    },
  ]);
  // TODO: Set the schema here
  // Example:
  // schema.addString('name').addNumber('cash');
  const batch = [updateUserMenu, updateAdminMenu];
  return Parse.Object.saveAll(batch, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  // TODO: set className here
  const className = 'w_menu';
  const userMenu = new Parse.Query(className);
  const revertUserMenu = await userMenu.get('H9vRfEYKhT');
  revertUserMenu.set('menuItems', [
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Dashboard',
      target: '',
      pageType: 'dashboard',
      description: '',
      objectId: '35KBoSgoAK',
    },
    {
      icon: 'far fa-newspaper',
      title: 'New Document',
      target: '_self',
      pageType: null,
      description: null,
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-nib',
          title: 'Sign yourself',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'sHAnZphf69',
        },
        {
          icon: 'fa-solid fa-paper-plane',
          title: 'Request signatures',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: '8mZzFxbG1z',
        },
        {
          icon: 'fas fa-file-signature',
          title: 'New template',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'template',
        },
      ],
    },
    {
      icon: 'fa-solid fa-file-contract',
      title: 'Templates',
      target: '_self',
      pageType: 'report',
      description: '',
      objectId: '6TeaPr321t',
    },
    {
      icon: 'fas fa-folder',
      title: 'OpenSign™ Drive',
      target: '_self',
      pageType: 'mf',
      description: '',
      objectId:
        'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive',
    },
    {
      icon: 'fas fa-address-card',
      title: 'Reports',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-signature',
          title: 'Need your sign',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '4Hhwbp482K',
        },
        {
          icon: 'fas fa-tasks',
          title: 'In Progress',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '1MwEuxLEkF',
        },
        {
          icon: 'fas fa-check-circle',
          title: 'Completed',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'kQUoW4hUXz',
        },
        {
          icon: 'fas fa-edit',
          title: 'Drafts',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'ByHuevtCFY',
        },
        {
          icon: 'fas fa-times-circle',
          title: 'Declined',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'UPr2Fm5WY3',
        },
        {
          icon: 'fas fa-hourglass-end',
          title: 'Expired',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'zNqBHXHsYH',
        },
        {
          icon: 'fa-solid fa-address-book',
          title: 'Contactbook',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '5KhaPr482K',
        },
      ],
    },
    {
      icon: 'fas fa-cog',
      title: 'Settings',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-fancy',
          title: 'My Signature',
          target: '_self',
          pageType: 'mf',
          description: '',
          objectId:
            'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/managesign',
        },
      ],
    },
  ]);

  const adminMenu = new Parse.Query(className);
  const revertAdminMenu = await adminMenu.get('VPh91h0ZHk');
  revertAdminMenu.set('menuItems', [
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Dashboard',
      target: '',
      pageType: 'dashboard',
      description: '',
      objectId: '35KBoSgoAK',
    },
    {
      icon: 'far fa-newspaper',
      title: 'New Document',
      target: '_self',
      pageType: null,
      description: null,
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-nib',
          title: 'Sign yourself',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'sHAnZphf69',
        },
        {
          icon: 'fa-solid fa-paper-plane',
          title: 'Request signatures',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: '8mZzFxbG1z',
        },
        {
          icon: 'fas fa-file-signature',
          title: 'New template',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'template',
        },
      ],
    },
    {
      icon: 'fa-solid fa-file-contract',
      title: 'Templates',
      target: '_self',
      pageType: 'report',
      description: '',
      objectId: '6TeaPr321t',
    },
    {
      icon: 'fas fa-folder',
      title: 'OpenSign™ Drive',
      target: '_self',
      pageType: 'mf',
      description: '',
      objectId:
        'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive',
    },
    {
      icon: 'fas fa-address-card',
      title: 'Reports',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-signature',
          title: 'Need your sign',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '4Hhwbp482K',
        },
        {
          icon: 'fas fa-tasks',
          title: 'In Progress',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '1MwEuxLEkF',
        },
        {
          icon: 'fas fa-check-circle',
          title: 'Completed',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'kQUoW4hUXz',
        },
        {
          icon: 'fas fa-edit',
          title: 'Drafts',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'ByHuevtCFY',
        },
        {
          icon: 'fas fa-times-circle',
          title: 'Declined',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'UPr2Fm5WY3',
        },
        {
          icon: 'fas fa-hourglass-end',
          title: 'Expired',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: 'zNqBHXHsYH',
        },
        {
          icon: 'fa-solid fa-address-book',
          title: 'Contactbook',
          target: '_self',
          pageType: 'report',
          description: '',
          objectId: '5KhaPr482K',
        },
      ],
    },
    {
      icon: 'fas fa-cog',
      title: 'Settings',
      target: '_self',
      pageType: null,
      description: '',
      objectId: null,
      children: [
        {
          icon: 'fas fa-pen-fancy',
          title: 'My Signature',
          target: '_self',
          pageType: 'mf',
          description: '',
          objectId:
            'remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/managesign',
        },
        {
          icon: 'far fa-user',
          title: 'Add User',
          target: '_self',
          pageType: 'form',
          description: '',
          objectId: 'lM0xRnM3iE',
        },
      ],
    },
  ]);
  // TODO: Set the schema here
  // Example:
  // schema.addString('name').addNumber('cash');
  const batch = [revertUserMenu, revertAdminMenu];
  return Parse.Object.saveAll(batch, { useMasterKey: true });
};
