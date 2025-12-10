const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Asegúrate de que estas variables estén en tu archivo .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento para Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'vet-app/mascotas', // Carpeta en Cloudinary
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: file.originalname.split('.')[0] + '-' + Date.now(),
        };
    },
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload,
};