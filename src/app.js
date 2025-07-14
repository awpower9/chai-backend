import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';

dotenv.config();
const app =express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
}))


app.use(express.json())
app.use(urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

import userRouter from './routes/user.routes.js'

app.use("/api/v1/user",userRouter)
export {app}