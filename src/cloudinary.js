import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhcfy06yp', // Nombre de tu cuenta de Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY || '282866133662773', // Clave de API
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aMhlW5ideTbBQSmOqeg8nYrsJMc',  // Secreto de API
  secure: true, // Usa HTTPS
});

export { cloudinary }; 