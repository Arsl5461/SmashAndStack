const { Organization, ExpenseCategory, Expense } = require('../models');
const logger = require('../../config/logger');
const { toSlug } = require('../../modules/expenseCategories/expenseCategory.repository');

const REQUIRED_CATEGORIES = [
  'Clover Fees',
  'DoorDash Commission',
  'Uber Eats Commission',
  'Grubhub Commission',
];

function isBareClover(name = '') {
  return /^clover$/i.test(String(name).trim());
}

async function ensureExpenseCategories() {
  const organizations = await Organization.find({}).select('_id');

  for (const organization of organizations) {
    const categories = await ExpenseCategory.find({ organizationId: organization._id });
    const clover = categories.find((item) => isBareClover(item.name));
    const cloverFees = categories.find((item) => /^clover\s+fees$/i.test(item.name));

    if (clover && !cloverFees) {
      await Expense.updateMany(
        { organizationId: organization._id, category: clover.name },
        { $set: { category: 'Clover Fees' } }
      );
      clover.name = 'Clover Fees';
      clover.slug = toSlug('Clover Fees');
      clover.isActive = true;
      await clover.save();
    } else if (clover && cloverFees) {
      await Expense.updateMany(
        { organizationId: organization._id, category: clover.name },
        { $set: { category: cloverFees.name } }
      );
      await ExpenseCategory.deleteOne({ _id: clover._id });
    }

    const existing = await ExpenseCategory.find({ organizationId: organization._id });
    const slugs = new Set(existing.map((item) => item.slug));

    for (const name of REQUIRED_CATEGORIES) {
      const slug = toSlug(name);
      if (slugs.has(slug)) continue;
      await ExpenseCategory.create({
        organizationId: organization._id,
        name,
        slug,
        isActive: true,
      });
      slugs.add(slug);
    }
  }

  logger.info('Expense categories ensured');
}

module.exports = { ensureExpenseCategories };
