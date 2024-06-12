import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
      app.listen(PORT, () => {
        console.log(`SERVER CONNECTED ON PORT ${PORT}`);
      })
  })
  .catch( 
    (error) => {
        console.log(error);
    }
  );
