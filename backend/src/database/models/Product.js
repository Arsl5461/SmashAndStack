const mongoose = require('mongoose');
const { PRODUCT_CATEGORIES } = require('../../constants/enums');

const productSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: Object.values(PRODUCT_CATEGORIES),
      default: PRODUCT_CATEGORIES.CHICKEN,
    },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    image: { type: String, default: '' },
    sku: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ organizationId: 1, storeId: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
