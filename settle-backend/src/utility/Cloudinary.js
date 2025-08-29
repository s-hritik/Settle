import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileDataUri) => {
    try {
        if (!fileDataUri) return null;

        const response = await cloudinary.uploader.upload(fileDataUri, {
            resource_type: 'auto'
        });

        return response;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return null;
    }
}

export { uploadOnCloudinary };