import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import dotenv from 'dotenv';

dotenv.config(); // <- load environment variables here

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`✅ DB connected — HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('❌ DB connection error:', error);
    throw error;
  }
};

export default connectDB;
  