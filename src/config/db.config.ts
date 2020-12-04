import mongoose from "mongoose";

import { config } from "./env.config";

export const connectDB = async () => {
   try {
      const { MONGO_URI, DB_NAME } = config;

      await mongoose.connect(MONGO_URI, { 
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useCreateIndex: true
      });

      console.log(`[INFO] --mongoose: connected to database ${DB_NAME}`);
   } catch(err) {
      console.error(`[ERROR] --mongoose: error connecting to database\n ${err}`)
   }
}