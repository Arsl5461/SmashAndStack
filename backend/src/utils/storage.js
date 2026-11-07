const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ValidationError } = require('./AppError');

const uploadDir = path.resolve(process.cwd(), 'uploads', 'receipts');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ValidationError('File must be an image or PDF'));
  }
  return cb(null, true);
};

const uploadOptions = {
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
};

const uploadReceipt = multer(uploadOptions).single('receipt');
const uploadAttachment = multer(uploadOptions).single('attachment');

function publicFileUrl(_req, filename) {
  if (!filename) return '';
  return `/uploads/receipts/${filename}`;
}

module.exports = {
  uploadReceipt,
  uploadAttachment,
  publicFileUrl,
};
