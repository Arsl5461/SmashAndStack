const productRepository = require('./product.repository');
const { NotFoundError } = require('../../utils/AppError');

async function listProducts(auth, query) {
  return productRepository.list(auth, query);
}

async function getProduct(auth, id) {
  const product = await productRepository.findById(id, auth.organizationId);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

async function createProduct(auth, payload) {
  return productRepository.create({
    ...payload,
    organizationId: auth.organizationId,
    storeId: payload.storeId || null,
  });
}

async function updateProduct(auth, id, payload) {
  const product = await productRepository.updateById(id, auth.organizationId, payload);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

async function deleteProduct(auth, id) {
  const product = await productRepository.remove(id, auth.organizationId);
  if (!product) throw new NotFoundError('Product not found');
  return { deleted: true };
}

async function deleteProducts(auth, ids) {
  const deleted = await productRepository.removeMany(ids, auth.organizationId);
  return { deleted };
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, deleteProducts };
