import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import connectDB from  './db/index.js'
import { app } from './app.js'

dotenv.config()

connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`listening on port ${process.env.PORT}`)
    })

}).catch((error)=>{console.log("MONGODB connection failed !!! "+error)});