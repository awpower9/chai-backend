import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
import { ApiResponse } from '../utils/ApiResponse.js'
import bcrypt from 'bcrypt'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Couldn't generate tokens");
    }
}
const registerUser=asyncHandler(async (req,res)=>{
    const {fullName,email,username ,password}=req.body
    if (!fullName || fullName.trim() === "") {
        throw new ApiError(400, "Enter fullName please");
    }
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Enter email please");
    }
    if (!username || username.trim() === "") {
        throw new ApiError(400, "Enter username please");
    }
    if (!password || password.trim() === "") {
        throw new ApiError(400, "Enter password please");
    }

    const existedUser=await User.findOne({username})
    const existedEmail=await User.findOne({email})
    if(existedEmail){
        throw new ApiError(409,`User with email already exists`)
    }
    if(existedUser){
        throw new ApiError(409,`User with username already exists`)
    }
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,`Avatar is necessary`)
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar || !avatar.url) {
        throw new ApiError(400, `Avatar is necessary`)
    }

    const user=await User.create({
        fullName,
        username:username.toLowerCase(),
        email:email,
        avatar:avatar.url,
        coverImage:coverImage?.url|| "",
        password:password
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken").lean()

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registeration")
    }
    return res.status(200).json(
        new ApiResponse(200,createdUser,"user register successfully")
    )
})

const loginUser=asyncHandler(async (req,res)=>{
    const {username,email,password}=req.body

    if ((!username || username.trim() === "") && (!email || email.trim() === "")) {
        throw new ApiError(400, "Enter username/email please");
    }
    if (!password || password.trim() === "") {
        throw new ApiError(400, "Enter password please");
    }
    const user = await User.findOne({
        $or: [
            email ? { email } : null,
            username ? { username } : null
        ].filter(Boolean)
    });
 
    if(!user){
        throw new ApiError(409,`User doesnt exists`)
    }
    const passwordCorrect=await user.isPasswordCorrect(password)
    if(!passwordCorrect){
        throw new ApiError(400,"Wrong password")

    }
   
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedinUser=await User.findById(user._id).select("-password -refreshToken").lean();
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,{
            user:loggedinUser,accessToken,refreshToken
        },"User loggedin successfully")
    )
})

const logoutUser=asyncHandler(async (req,res)=>{
        const userId=req.user._id
        await User.findByIdAndUpdate(
            userId,
        {$set: {
            refreshToken:undefined
        }},{
                new:true
            }
        )
        const options={
        httpOnly:true,
        secure:true
    }
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookie.refreshAccessToken || req.body.refreshAccessToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauth req")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token used")
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200).cookie("accessToken",accessToken,options).cookie("newRefreshToken",newRefreshToken,options).json(
            new ApiResponse(200,{
                accessToken,refreshToken:newRefreshToken
            },"Refresh Token generated successfully")
        )
    } catch (error) {
        throw new ApiError(401,"Invalid refrehs token")
    }


})

const changeUserPassword=asyncHandler(async (req,res)=>{
    const accessToken=req.cookie.accessToken || req.header
    const user=await User.findById(req.user?._id)
   
    const {oldPassword,newPassword}=req.body
    const isCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isCorrect){
        throw new ApiError(400,"wrong password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    res.status(200).json(new ApiResponse(200,"Password changed successfully"))
})

const getCurrentUser=asyncHandler( async (req,res)=>{
    return res.status(200).json(200,req.user,"current userfetched successfully")
})

const updateAccountDetails=asyncHandler(async (req,res)=>{
    const {fullName,email}=req.body
    if ((!fullName || fullName.trim() === "") || (!email || email.trim() === "") ) {
        throw new ApiError(400, "Enter fullName/email please");
    }
   
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
    },{new:true}).select("-password")
   return res.status(200).json(new ApiResponse(200,"Account details updated successfully"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.files?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Upload avatar")
    }
    const avatar=uploadOnCloudinary(avatarLocalPath)
    if (!avatar || !avatar.url) {
        throw new ApiError(400, `Avatar is necessary`)
    }
    await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    }).select("-password")
    return res.status(200).json(new ApiResponse(200,"Avatar updated"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.files?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"Upload avatar")
    }
    const coverImage=uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage || !coverImage.url) {
        throw new ApiError(400, `Avatar is necessary`)
    }
    await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
    }).select("-password")
    return res.status(200).json(new ApiResponse(200,"CoverImage updated"))

})
export {registerUser,loginUser,logoutUser,refreshAccessToken}   