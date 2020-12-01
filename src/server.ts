import app from "./app";

import { config } from "./config/env.config";
import { connectDB } from "./config/db.config";

void async function() {
   await connectDB();

   app.listen(config.PORT);

   console.log(`[INFO]: ${process.env.NODE_ENV} sever started. Available at ==> http://lcoalhost:${config.PORT}/api/v1`);
}();