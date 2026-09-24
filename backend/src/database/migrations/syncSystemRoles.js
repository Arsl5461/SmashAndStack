const { Role } = require('../models');
const logger = require('../../config/logger');
const { ROLE_DEFINITIONS } = require('../../constants/roles');

async function syncSystemRoles() {
  for (const definition of ROLE_DEFINITIONS) {
    await Role.updateMany(
      { slug: definition.slug, isSystem: true },
      {
        $set: {
          name: definition.name,
          description: definition.description,
          permissions: definition.permissions,
        },
      }
    );
  }
  logger.info('System roles synced');
}

module.exports = { syncSystemRoles };
