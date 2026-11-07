const mongoose = require('mongoose');

const moneyBorrowedSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    borrowedFrom: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    borrowedDate: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['OPEN', 'PAID'],
      default: 'OPEN',
    },
    paidAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

moneyBorrowedSchema.index({ organizationId: 1, storeId: 1, borrowedDate: -1 });
moneyBorrowedSchema.index({ organizationId: 1, status: 1, borrowedDate: -1 });

module.exports = mongoose.model('MoneyBorrowed', moneyBorrowedSchema);
