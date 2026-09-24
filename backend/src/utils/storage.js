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

const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new ValidationError('Receipt must be an image or PDF'));
    }
    return cb(null, true);
  },
}).single('receipt');

function publicFileUrl(_req, filename) {
  if (!filename) return '';
  return `/uploads/receipts/${filename}`;
}

module.exports = {
  uploadReceipt,
  publicFileUrl,
};
