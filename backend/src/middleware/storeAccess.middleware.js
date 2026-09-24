const mongoose = require('mongoose');
const { ForbiddenError, ValidationError } = require('../utils/AppError');

function extractRequestedStoreId(req) {
  return (
    req.params.storeId ||
    req.body?.storeId ||
    req.query.storeId ||
    req.headers['x-store-id'] ||
    null
  );
}

const checkStoreAccess = (req, res, next) => {
  if (!req.auth) {
    return next(new ForbiddenError('Store access context missing'));
  }

  const requestedStoreId = extractRequestedStoreId(req);
  req.storeContext = {
    requestedStoreId: requestedStoreId || null,
    allowedStoreIds: req.auth.storeIds,
  };

  if (req.auth.isSuperAdmin) {
    return next();
  }

  if (!requestedStoreId) {
    return next();
  }

  if (!mongoose.Types.ObjectId.isValid(requestedStoreId)) {
    return next(new ValidationError('Invalid store id'));
  }

  const allowed = req.auth.storeIds.map((id) => id.toString());
  if (!allowed.includes(requestedStoreId.toString())) {
    return next(new ForbiddenError('You do not have access to this store'));
  }

  return next();
};

function scopedStoreFilter(auth, requestedStoreId) {
  if (requestedStoreId) {
    return { storeId: requestedStoreId };
  }

  if (auth.isSuperAdmin) {
    return {};
  }

  return { storeId: { $in: auth.storeIds } };
}

module.exports = {
  checkStoreAccess,
  extractRequestedStoreId,
  scopedStoreFilter,
};
