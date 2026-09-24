const mongoose = require('mongoose');

const saleProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    orderReference: { type: String, trim: true },
    customerName: { type: String, trim: true, default: 'Walk-in Guest' },
    products: { type: [saleProductSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    saleDate: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

saleSchema.index({ organizationId: 1, storeId: 1, saleDate: -1 });
saleSchema.index({ organizationId: 1, saleDate: -1 });
saleSchema.index({ storeId: 1, paymentMethod: 1, saleDate: -1 });

module.exports = mongoose.model('Sale', saleSchema);
