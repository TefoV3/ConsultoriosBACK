import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dft1rgcs3', // Nombre de tu cuenta de Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY || '162666438984266', // Clave de API
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lzfSC3-KUciUkP-HDt_tlj9jn04',  // Secreto de API
  secure: true, // Usa HTTPS
});

export { cloudinary }; 