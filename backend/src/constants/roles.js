const { PERMISSIONS, ALL_PERMISSIONS } = require('./permissions');

const ROLE_SLUGS = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  STAFF: 'STAFF',
});

const ROLE_DEFINITIONS = Object.freeze([
  {
    name: 'Super Admin',
    slug: ROLE_SLUGS.SUPER_ADMIN,
    description: 'Full platform access across every store, user, and report.',
    permissions: ALL_PERMISSIONS,
    isSystem: true,
  },
  {
    name: 'Admin',
    slug: ROLE_SLUGS.ADMIN,
    description: 'Manages assigned stores, sales, expenses, and reports.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.STORES_CREATE,
      PERMISSIONS.STORES_READ,
      PERMISSIONS.STORES_UPDATE,
      PERMISSIONS.STORES_ANALYTICS,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_READ,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_READ,
      PERMISSIONS.SALES_UPDATE,
      PERMISSIONS.SALES_DELETE,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.SETTINGS_READ,
    ],
    isSystem: true,
  },
  {
    name: 'Manager',
    slug: ROLE_SLUGS.MANAGER,
    description: 'Operates assigned stores: sales, expenses, and limited analytics.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.STORES_READ,
      PERMISSIONS.STORES_ANALYTICS,
      PERMISSIONS.EXPENSES_READ,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_READ,
      PERMISSIONS.SALES_UPDATE,
    ],
    isSystem: true,
  },
  {
    name: 'Accountant',
    slug: ROLE_SLUGS.ACCOUNTANT,
    description: 'Manages expenses, reviews sales, and generates profit & loss reports.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.STORES_READ,
      PERMISSIONS.STORES_ANALYTICS,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_READ,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE,
      PERMISSIONS.SALES_READ,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT,
    ],
    isSystem: true,
  },
  {
    name: 'Staff',
    slug: ROLE_SLUGS.STAFF,
    description: 'Limited operational access for assigned-store sales.',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_READ,
    ],
    isSystem: true,
  },
]);

module.exports = {
  ROLE_SLUGS,
  ROLE_DEFINITIONS,
};
