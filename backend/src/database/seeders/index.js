const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const env = require('../../config/environment');
const { connectDatabase, disconnectDatabase } = require('../../config/database');
const logger = require('../../config/logger');
const { ROLE_DEFINITIONS } = require('../../constants/roles');
const { Organization, Role, User } = require('../models');

async function seed() {
  await connectDatabase();

  let organization = await Organization.findOne({ slug: 'smash-and-stack' });
  if (!organization) {
    organization = await Organization.create({
      name: 'Smash & Stack',
      slug: 'smash-and-stack',
      email: 'hq@smashandstack.com',
      phone: '',
      address: '',
      isActive: true,
    });
    logger.info('Created Smash & Stack organization');
  }

  for (const definition of ROLE_DEFINITIONS) {
    await Role.updateOne(
      { slug: definition.slug },
      {
        $set: {
          name: definition.name,
          description: definition.description,
          permissions: definition.permissions,
          isSystem: true,
          isActive: true,
          organizationId: organization._id,
        },
      },
      { upsert: true }
    );
  }

  const superRole = await Role.findOne({ slug: 'SUPER_ADMIN' });
  const email = env.superAdmin.email.toLowerCase();
  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      organizationId: organization._id,
      name: env.superAdmin.name,
      email,
      password: env.superAdmin.password,
      roleId: superRole._id,
      stores: [],
      isActive: true,
    });
    logger.info(`Created login ${email}`);
  } else {
    logger.info(`Login already exists: ${email}`);
  }

  logger.info('No demo stores, sales, or extra users were created.');
  logger.info(`Email: ${email}`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  logger.error(error);
  await disconnectDatabase();
  process.exit(1);
});
