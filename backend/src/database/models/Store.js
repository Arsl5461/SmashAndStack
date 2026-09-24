const mongoose = require('mongoose');
const { STORE_STATUS } = require('../../constants/enums');

const storeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    storeCode: { type: String, required: true, trim: true, uppercase: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'United States' },
    postalCode: { type: String, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    openingDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(STORE_STATUS),
      default: STORE_STATUS.ACTIVE,
    },
    logo: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

storeSchema.index({ organizationId: 1, storeCode: 1 }, { unique: true });
storeSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Store', storeSchema);
