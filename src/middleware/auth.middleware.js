import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import dotenv from "dotenv"

dotenv.config()
export const verifyJWT=async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            return next(new ApiError(401,"Unauth req"));
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            return next(new ApiError(400,"Invalid access token"));
        }
        req.user=user
        next()
    } catch (error) {
        return next(new ApiError(400,"Invalid access token"));
    }
}