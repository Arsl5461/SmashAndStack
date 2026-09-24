const { PaymentMethod, Sale, Expense, Order } = require('../../database/models');
const logger = require('../../config/logger');
const { toSlug } = require('../../modules/paymentMethods/paymentMethod.repository');

function isCardMethod(name = '') {
  return /^(debit|credit)\s*cards?$/i.test(String(name).trim());
}

function isAtmWithdraw(name = '') {
  return /atm\s*withdraw/i.test(String(name).trim());
}

async function retargetUsage(organizationId, fromNames, toName) {
  const filter = { organizationId, paymentMethod: { $in: fromNames } };
  await Promise.all([
    Sale.updateMany(filter, { $set: { paymentMethod: toName } }),
    Expense.updateMany(filter, { $set: { paymentMethod: toName } }),
    Order.updateMany(filter, { $set: { paymentMethod: toName } }),
  ]);
}

async function normalizePaymentMethodNames() {
  const methods = await PaymentMethod.find({});
  const byOrg = new Map();
  methods.forEach((method) => {
    const key = String(method.organizationId);
    const list = byOrg.get(key) || [];
    list.push(method);
    byOrg.set(key, list);
  });

  for (const [organizationId, orgMethods] of byOrg.entries()) {
    const atmMethods = orgMethods.filter((item) => isAtmWithdraw(item.name) || /^atm\s*deposit$/i.test(item.name));
    const withdrawMethods = atmMethods.filter((item) => isAtmWithdraw(item.name));
    if (withdrawMethods.length) {
      const fromNames = [...new Set(withdrawMethods.map((item) => item.name))];
      await retargetUsage(organizationId, fromNames, 'ATM Deposit');
      const existingDeposit = orgMethods.find((item) => /^atm\s*deposit$/i.test(item.name));
      const keep = existingDeposit || withdrawMethods[0];
      keep.name = 'ATM Deposit';
      keep.slug = toSlug(keep.name);
      keep.isActive = true;
      await keep.save();
      const extras = atmMethods.filter((item) => String(item._id) !== String(keep._id));
      if (extras.length) {
        await PaymentMethod.deleteMany({ _id: { $in: extras.map((item) => item._id) } });
      }
    }

    const cardMethods = orgMethods.filter((item) => isCardMethod(item.name));
    if (!cardMethods.length) continue;

    const targetName = 'Debit/Credit Card';
    const fromNames = [...new Set(cardMethods.map((item) => item.name))];
    await retargetUsage(organizationId, fromNames, targetName);

    const [keep, ...extras] = cardMethods;
    keep.name = targetName;
    keep.slug = toSlug(targetName);
    keep.isActive = true;
    await keep.save();
    if (extras.length) {
      await PaymentMethod.deleteMany({ _id: { $in: extras.map((item) => item._id) } });
    }
  }

  logger.info('Payment method names normalized');
}

module.exports = { normalizePaymentMethodNames };
