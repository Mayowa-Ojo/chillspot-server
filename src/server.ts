import app from "./app";

import { config } from "./config/env.config";
import { connectDB } from "./config/db.config";

const main = async () => {
   await connectDB();

   app.listen(config.PORT);
}

main().then(() => {
   console.log(`[INFO]: development sever started. Available at ==> http://lcoalhost:${config.PORT}/api/v1`);
});