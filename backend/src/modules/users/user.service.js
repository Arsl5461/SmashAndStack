const userRepository = require('./user.repository');
const { ConflictError, NotFoundError } = require('../../utils/AppError');

async function listUsers(auth, query) {
  return userRepository.list(auth.organizationId, query);
}

async function getUser(auth, id) {
  const user = await userRepository.findById(id, auth.organizationId);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

async function createUser(auth, payload) {
  const existing = await userRepository.findByEmail(auth.organizationId, payload.email);
  if (existing) throw new ConflictError('A user with this email already exists');

  return userRepository.create({
    ...payload,
    organizationId: auth.organizationId,
    email: payload.email.toLowerCase(),
  });
}

async function updateUser(auth, id, payload) {
  if (payload.email) {
    const existing = await userRepository.findByEmail(auth.organizationId, payload.email);
    if (existing && existing._id.toString() !== id) {
      throw new ConflictError('A user with this email already exists');
    }
    payload.email = payload.email.toLowerCase();
  }

  const user = await userRepository.updateById(id, auth.organizationId, payload);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

async function deleteUser(auth, id) {
  const user = await userRepository.remove(id, auth.organizationId);
  if (!user) throw new NotFoundError('User not found');
  return { deleted: true };
}

async function deleteUsers(auth, ids) {
  const deleted = await userRepository.removeMany(ids, auth.organizationId, auth.userId);
  return { deleted };
}

async function resetPassword(auth, id, password) {
  const user = await userRepository.updateById(id, auth.organizationId, { password });
  if (!user) throw new NotFoundError('User not found');
  return { reset: true };
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers,
  resetPassword,
};
