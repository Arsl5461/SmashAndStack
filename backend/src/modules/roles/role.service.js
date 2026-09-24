const roleRepository = require('./role.repository');
const { ConflictError, NotFoundError, ForbiddenError } = require('../../utils/AppError');
const { PERMISSION_GROUPS } = require('../../constants/permissions');
const { ROLE_SLUGS } = require('../../constants/roles');

async function listRoles(auth) {
  return roleRepository.list(auth.organizationId);
}

async function createRole(auth, payload) {
  const slug = (payload.slug || payload.name).toUpperCase().replace(/\s+/g, '_');
  const existing = await roleRepository.findBySlug(slug);
  if (existing) throw new ConflictError('Role slug already exists');

  return roleRepository.create({
    ...payload,
    slug,
    organizationId: auth.organizationId,
    isSystem: false,
  });
}

async function updateRole(auth, id, payload) {
  const role = await roleRepository.findById(id);
  if (!role) throw new NotFoundError('Role not found');
  if (role.slug === ROLE_SLUGS.SUPER_ADMIN && !auth.isSuperAdmin) {
    throw new ForbiddenError('Super Admin role cannot be modified');
  }
  return roleRepository.updateById(id, payload);
}

async function deleteRole(auth, id) {
  const role = await roleRepository.findById(id);
  if (!role) throw new NotFoundError('Role not found');
  if (role.isSystem) throw new ForbiddenError('System roles cannot be deleted');
  await roleRepository.remove(id);
  return { deleted: true };
}

function permissionCatalog() {
  return PERMISSION_GROUPS;
}

module.exports = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  permissionCatalog,
};
