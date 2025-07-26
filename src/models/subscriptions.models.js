import mongoose from 'mongoose'
import { User } from './user.models'

const subscriptionSchema=mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User    
    }

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)