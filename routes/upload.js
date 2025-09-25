
import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';

const router = express.Router();
const storage = multer.memoryStorage(); // On garde le fichier en mémoire
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
