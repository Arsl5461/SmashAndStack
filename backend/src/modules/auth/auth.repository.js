const bcrypt = require('bcryptjs');
const { User } = require('../../database/models');

const storePopulate = {
  path: 'stores',
  select: 'name storeCode status city',
  match: { deletedAt: null },
};

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshTokenHash')
    .populate('roleId')
    .populate(storePopulate);
}

async function findByEmailForReset(email) {
  return User.findOne({ email: email.toLowerCase() }).select(
    '+password +passwordResetTokenHash +passwordResetExpires +passwordResetSentAt +passwordResetAttempts'
  );
}

async function findByIdWithPassword(id) {
  return User.findById(id).select('+password');
}

async function savePasswordReset(userId, payload) {
  return User.findByIdAndUpdate(userId, payload, { new: true });
}

async function findByIdForAuth(id) {
  return User.findById(id)
    .select('+refreshTokenHash')
    .populate('roleId')
    .populate(storePopulate);
}

async function saveRefreshToken(userId, tokenHash) {
  return User.findByIdAndUpdate(userId, { refreshTokenHash: tokenHash, lastLogin: new Date() });
}

async function clearRefreshToken(userId) {
  return User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

async function compareRefreshHash(token, hash) {
  if (!token || !hash) return false;
  return bcrypt.compare(token, hash);
}

module.exports = {
  findByEmail,
  findByEmailForReset,
  findByIdWithPassword,
  findByIdForAuth,
  saveRefreshToken,
  savePasswordReset,
  clearRefreshToken,
  compareRefreshHash,
};
