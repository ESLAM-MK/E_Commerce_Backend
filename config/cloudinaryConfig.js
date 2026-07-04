import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return {
      folder: "Ecommerce",
      format: file.mimetype.split('/')[1], 
    };
  },
});

const uploadCloud = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 5 } //5 mp
});

export default uploadCloud;