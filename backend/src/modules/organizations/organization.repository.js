const { Organization } = require('../../database/models');

async function findById(id) {
  return Organization.findById(id);
}

async function updateById(id, payload) {
  return Organization.findByIdAndUpdate(id, payload, { new: true });
}

module.exports = {
  findById,
  updateById,
};
