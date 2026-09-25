const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');
const { AppError, UnauthorizedError, ValidationError } = require('../../utils/AppError');
const { ROLE_SLUGS } = require('../../constants/roles');
const env = require('../../config/environment');
const { sendOtpEmail } = require('../../utils/mailer');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../../utils/token');

const GENERIC_RESET_MESSAGE = 'If an account exists for that email, we sent a verification code.';

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

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function assertValidOtp(user, otp) {
  if (!user?.passwordResetTokenHash || !user.passwordResetExpires) {
    throw new ValidationError('Invalid or expired verification code');
  }
  if (user.passwordResetExpires.getTime() < Date.now()) {
    throw new ValidationError('This verification code has expired. Request a new one.');
  }
  if ((user.passwordResetAttempts || 0) >= 5) {
    throw new ValidationError('Too many incorrect codes. Request a new one.');
  }

  const matches = await bcrypt.compare(otp, user.passwordResetTokenHash);
  if (!matches) {
    await authRepository.savePasswordReset(user._id, {
      passwordResetAttempts: (user.passwordResetAttempts || 0) + 1,
    });
    throw new ValidationError('Invalid or expired verification code');
  }
}

async function forgotPassword({ email }) {
  const user = await authRepository.findByEmailForReset(email);
  if (!user || !user.isActive) {
    return { message: GENERIC_RESET_MESSAGE };
  }

  if (user.passwordResetSentAt) {
    const waitMs = env.otp.resendSeconds * 1000 - (Date.now() - user.passwordResetSentAt.getTime());
    if (waitMs > 0) {
      throw new AppError(`Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code`, 429);
    }
  }

  const otp = createOtp();
  await authRepository.savePasswordReset(user._id, {
    passwordResetTokenHash: await bcrypt.hash(otp, 10),
    passwordResetExpires: new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000),
    passwordResetSentAt: new Date(),
    passwordResetAttempts: 0,
  });

  try {
    await sendOtpEmail({ to: user.email, name: user.name, otp });
  } catch (error) {
    await authRepository.savePasswordReset(user._id, {
      $unset: {
        passwordResetTokenHash: 1,
        passwordResetExpires: 1,
        passwordResetSentAt: 1,
      },
      $set: { passwordResetAttempts: 0 },
    });
    throw error;
  }

  return { message: GENERIC_RESET_MESSAGE };
}

async function verifyOtp({ email, otp }) {
  const user = await authRepository.findByEmailForReset(email);
  if (!user || !user.isActive) {
    throw new ValidationError('Invalid or expired verification code');
  }
  await assertValidOtp(user, otp);
  return { verified: true };
}

async function resetPasswordWithOtp({ email, otp, password }) {
  const user = await authRepository.findByEmailForReset(email);
  if (!user || !user.isActive) {
    throw new ValidationError('Invalid or expired verification code');
  }
  await assertValidOtp(user, otp);

  user.password = password;
  user.passwordResetAttempts = 0;
  await user.save();
  await authRepository.savePasswordReset(user._id, {
    $unset: {
      passwordResetTokenHash: 1,
      passwordResetExpires: 1,
      passwordResetSentAt: 1,
      refreshTokenHash: 1,
    },
    $set: { passwordResetAttempts: 0 },
  });

  return { reset: true };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Account is inactive or does not exist');
  }

  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  if (currentPassword === newPassword) {
    throw new ValidationError('New password must be different from the current password');
  }

  user.password = newPassword;
  await user.save();
  return { updated: true };
}

module.exports = {
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  verifyOtp,
  resetPasswordWithOtp,
  changePassword,
  serializeUser,
};
