const mongoose = require('mongoose');

const expensePaymentSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethods: {
      type: [expensePaymentSchema],
      default: [],
    },
    expenseDate: { type: Date, required: true, default: Date.now },
    receiptUrl: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

expenseSchema.index({ organizationId: 1, storeId: 1, expenseDate: -1 });
expenseSchema.index({ organizationId: 1, category: 1, expenseDate: -1 });
expenseSchema.index({ organizationId: 1, 'paymentMethods.method': 1 });

module.exports = mongoose.model('Expense', expenseSchema);
