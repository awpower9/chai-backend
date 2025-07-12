
// const asyncHandler=(func)=>
//     async (req,res,next)=>{
//         try {
//             await func(req,res,next)
//         } catch (error) {
//             res.send(error.code).json({
//                 success:false,
//                 message:error.message
//             })
//         }
//     }

const asyncHandler=(func)=>{
    return (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch((error)=>{
            next(error)
        })
    }
}

export {asyncHandler}