import dotenv from "dotenv";

import type { IEnvConfig } from "../declarations/index.d";

dotenv.config({ path: ".env" });

export const config: IEnvConfig = {
   PORT: process.env.PORT || 6000,
   NODE_ENV: process.env.NODE_ENV,
   API_VERSION: process.env.API_VERSION,
   MONGO_URI: process.env.MONGO_URI,
   DB_NAME: process.env.DB_NAME,
   JWT_SECRET: process.env.JWT_SECRET
}