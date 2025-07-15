import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

import dotenv from 'dotenv'
dotenv.config()
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary=async function (file_path) {
    try {
        if(!file_path) return null;
        const uploadResult = await cloudinary.uploader
       .upload(
           file_path,{
            resource_type:"auto"
           }
       )
       fs.unlinkSync(file_path)
       return uploadResult
    } catch (error) {
        fs.unlinkSync(file_path)
        return null

    }
}

export {uploadOnCloudinary}