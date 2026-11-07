const moneyBorrowedRepository = require('./moneyBorrowed.repository');
const { NotFoundError, ValidationError } = require('../../utils/AppError');
const { startOfDay } = require('../../utils/dateHelper');

async function listBorrowed(auth, query) {
  return moneyBorrowedRepository.list(auth, query);
}

async function getBorrowed(auth, id) {
  const item = await moneyBorrowedRepository.findById(id, auth.organizationId);
  if (!item) throw new NotFoundError('Borrowed money record not found');
  return item;
}

async function createBorrowed(auth, payload) {
  return moneyBorrowedRepository.create({
    ...payload,
    borrowedFrom: payload.borrowedFrom.trim(),
    note: payload.note?.trim() || '',
    status: 'OPEN',
    organizationId: auth.organizationId,
    createdBy: auth.userId,
    borrowedDate: payload.borrowedDate ? startOfDay(payload.borrowedDate) : new Date(),
  });
}

async function updateBorrowed(auth, id, payload) {
  const existing = await getBorrowed(auth, id);
  if (existing.status === 'PAID') {
    throw new ValidationError('Paid borrowed money records cannot be edited');
  }
  const update = { ...payload };
  if (payload.borrowedFrom) update.borrowedFrom = payload.borrowedFrom.trim();
  if (payload.note !== undefined) update.note = payload.note.trim();
  if (payload.borrowedDate) update.borrowedDate = startOfDay(payload.borrowedDate);
  return moneyBorrowedRepository.updateById(id, auth.organizationId, update);
}

async function markPaid(auth, id) {
  const existing = await getBorrowed(auth, id);
  if (existing.status === 'PAID') {
    throw new ValidationError('This record is already marked as paid');
  }
  return moneyBorrowedRepository.updateById(id, auth.organizationId, {
    status: 'PAID',
    paidAt: new Date(),
  });
}

async function deleteBorrowed(auth, id) {
  const item = await moneyBorrowedRepository.remove(id, auth.organizationId);
  if (!item) throw new NotFoundError('Borrowed money record not found');
  return { deleted: true };
}

async function deleteBorrowedMany(auth, ids) {
  const deleted = await moneyBorrowedRepository.removeMany(ids, auth);
  return { deleted };
}

module.exports = {
  listBorrowed,
  getBorrowed,
  createBorrowed,
  updateBorrowed,
  markPaid,
  deleteBorrowed,
  deleteBorrowedMany,
};
