import multer from 'multer';
import { BadRequestError } from '../../application/errors/bad-request.error.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// El archivo queda en memoria (req.file.buffer) y de ahí se sube al storage
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new BadRequestError('Formato no permitido', { image: 'Solo se aceptan imágenes JPG, PNG, WEBP o GIF' }));
      return;
    }
    cb(null, true);
  },
}).single('image');
