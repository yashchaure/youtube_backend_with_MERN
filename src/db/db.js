import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("MONGODB CONNECT TO DB SUCCESSFULLY");
    } catch (error) {
        console.log("MONGODB NOT CONNECTED TO DB", error);
    }
} 

export default connectDB;