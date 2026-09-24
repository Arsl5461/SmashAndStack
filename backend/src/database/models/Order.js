const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../../constants/enums');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    orderNumber: { type: String, required: true, trim: true },
    customer: {
      name: { type: String, trim: true, default: 'Walk-in Guest' },
      phone: { type: String, trim: true, default: '' },
    },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
    },
    orderDate: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.index({ organizationId: 1, storeId: 1, createdAt: -1 });
orderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ storeId: 1, status: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
