import Koa, { BaseContext, Context } from "koa";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import winston from "winston";
import bodyparser from "koa-bodyparser";

import { logger } from "./config/logger.config";
import { v1Router } from "./routes";
import { errorHandler, JwtError } from "./handlers/error.handler";

const app = new Koa();

app.use(errorHandler);

app.use(JwtError);

app.use(helmet());

app.use(cors());

app.use(logger(winston));

app.use(bodyparser());

app.use(v1Router.routes()).use(v1Router.allowedMethods());

export default app;
