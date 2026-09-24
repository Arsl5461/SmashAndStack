const PERMISSIONS = Object.freeze({
  DASHBOARD_READ: 'dashboard.read',

  STORES_CREATE: 'stores.create',
  STORES_READ: 'stores.read',
  STORES_UPDATE: 'stores.update',
  STORES_DELETE: 'stores.delete',
  STORES_ANALYTICS: 'stores.analytics',

  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_READ: 'expenses.read',
  EXPENSES_UPDATE: 'expenses.update',
  EXPENSES_DELETE: 'expenses.delete',

  SALES_CREATE: 'sales.create',
  SALES_READ: 'sales.read',
  SALES_UPDATE: 'sales.update',
  SALES_DELETE: 'sales.delete',

  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_READ: 'products.read',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',

  ORDERS_CREATE: 'orders.create',
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',

  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',

  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
});

const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS));

const PERMISSION_GROUPS = Object.freeze([
  { key: 'dashboard', label: 'Dashboard', permissions: [PERMISSIONS.DASHBOARD_READ] },
  {
    key: 'stores',
    label: 'Stores',
    permissions: [
      PERMISSIONS.STORES_CREATE,
      PERMISSIONS.STORES_READ,
      PERMISSIONS.STORES_UPDATE,
      PERMISSIONS.STORES_DELETE,
      PERMISSIONS.STORES_ANALYTICS,
    ],
  },
  {
    key: 'users',
    label: 'Users',
    permissions: [
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ],
  },
  {
    key: 'roles',
    label: 'Roles',
    permissions: [
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_READ,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses',
    permissions: [
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_READ,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE,
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    permissions: [
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_READ,
      PERMISSIONS.SALES_UPDATE,
      PERMISSIONS.SALES_DELETE,
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    permissions: [PERMISSIONS.REPORTS_READ, PERMISSIONS.REPORTS_EXPORT],
  },
  {
    key: 'settings',
    label: 'Settings',
    permissions: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_UPDATE],
  },
]);

module.exports = {
  PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
};
