const organizationRepository = require('./organization.repository');
const { NotFoundError } = require('../../utils/AppError');

async function getCurrent(organizationId) {
  const organization = await organizationRepository.findById(organizationId);
  if (!organization) {
    throw new NotFoundError('Organization not found');
  }
  return organization;
}

async function updateCurrent(organizationId, payload) {
  const organization = await organizationRepository.updateById(organizationId, payload);
  if (!organization) {
    throw new NotFoundError('Organization not found');
  }
  return organization;
}

module.exports = {
  getCurrent,
  updateCurrent,
};
