import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());


//import Route
import userRouter from "./routes/user.routes.js";



// Route Declaration
app.use("/api", userRouter);


export default app;