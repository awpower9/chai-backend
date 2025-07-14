import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

import dotenv from 'dotenv'
dotenv.config()
cloudinary.config({ 
        cloud_name: process.env.CLOUNDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUNDINARY_API_KEY, 
        api_secret: process.env.CLOUNDINARY_API_SECRET
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
       console.log("File is uploaded on cloudinary"+uploadResult.url)
       return uploadResult
    } catch (error) {
        fs.unlinkSync(file_path)
        return null

    }
}

export {uploadOnCloudinary}