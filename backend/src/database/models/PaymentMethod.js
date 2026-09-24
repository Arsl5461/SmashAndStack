const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

paymentMethodSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
