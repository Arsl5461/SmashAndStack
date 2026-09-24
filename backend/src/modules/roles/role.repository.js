const { Role } = require('../../database/models');

async function list(organizationId) {
  return Role.find({
    $or: [{ organizationId }, { organizationId: null }],
  }).sort({ isSystem: -1, name: 1 });
}

async function findById(id) {
  return Role.findById(id);
}

async function findBySlug(slug) {
  return Role.findOne({ slug: slug.toUpperCase() });
}

async function create(payload) {
  return Role.create(payload);
}

async function updateById(id, payload) {
  return Role.findByIdAndUpdate(id, payload, { new: true });
}

async function remove(id) {
  return Role.findByIdAndDelete(id);
}

module.exports = { list, findById, findBySlug, create, updateById, remove };
