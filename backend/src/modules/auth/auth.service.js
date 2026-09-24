const authRepository = require('./auth.repository');
const { UnauthorizedError } = require('../../utils/AppError');
const { ROLE_SLUGS } = require('../../constants/roles');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../../utils/token');

function serializeUser(user) {
  const role = user.roleId;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    organizationId: user.organizationId,
    role: {
      id: role?._id,
      name: role?.name,
      slug: role?.slug,
    },
    permissions: role?.permissions || [],
    stores: (user.stores || []).filter(Boolean),
    defaultStore: user.defaultStore,
    isSuperAdmin: role?.slug === ROLE_SLUGS.SUPER_ADMIN,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
  };
}

async function login({ email, password }) {
  const user = await authRepository.findByEmail(email);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshTokenHash = await hashToken(refreshToken);
  await authRepository.saveRefreshToken(user._id, refreshTokenHash);

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await authRepository.findByIdForAuth(decoded.sub);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  const matches = await authRepository.compareRefreshHash(refreshToken, user.refreshTokenHash);
  if (!matches) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  const accessToken = signAccessToken(user);
  const nextRefreshToken = signRefreshToken(user);
  await authRepository.saveRefreshToken(user._id, await hashToken(nextRefreshToken));

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken: nextRefreshToken,
  };
}

async function logout(userId) {
  await authRepository.clearRefreshToken(userId);
}

async function me(user) {
  const hydrated = await authRepository.findByIdForAuth(user._id);
  return serializeUser(hydrated);
}

module.exports = {
  login,
  refresh,
  logout,
  me,
  serializeUser,
};
