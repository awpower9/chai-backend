import dotenv from 'dotenv'

import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import express from 'express'
import connectDB from  './db/index.js'

dotenv.config()
connectDB().then(()=>{
    app.on("error",(error)=>{
             console.log(error)
        })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`listeing on port ${process.env.PORT}`)
    })

}).catch((error)=>{console.log("MONGODB connection failed !!! "+error)});