import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

import { ApiResponse } from '../utils/ApiResponse.js'
const registerUser=asyncHandler(async (req,res)=>{
    const {fullName,email,username ,password}=req.body
    if([fullName,email,username ,password].some((i)=>i.trim()==="")){
        throw new ApiError(400,`enter ${i} please`)
    }

    const existedUser=User.findOne({username})
    const existedEmail=User.findOne({email})
    if(existedEmail){
        throw new ApiError(409,`User with email already exists`)
    }
    if(existedUser){
        throw new ApiError(409,`User with username already exists`)
    }
    
    const avatarLocalPath=req.files?.avatar[0].path
    const coverImageLocalPath=req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(400,`Avatar is necessary`)
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,`Avatar is necessary`)
    }

    const user=await User.create({
        fullName,
        username:username.toLowerCase(),
        email:email,
        avatar:avatar.url,
        coverImage:coverImage?.url|| "",
        password:password
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(createdUser){
        throw new ApiError(500,"Something went wrong while registeration")
    }
    return res.response(200).json(
        new ApiResponse(200,createdUser,"user register successfully")
    )
})

export {registerUser}