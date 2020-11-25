import Koa from "koa";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import winston from "winston";
import bodyParser from "koa-bodyparser";

import { logger } from "./config/logger.config";
import { v1Router } from "./routes";
import { errorHandler, JwtError, NotFoundError } from "./handlers/error.handler";

const app = new Koa();

app.use(JwtError);

app.use(errorHandler);

app.use(helmet());

app.use(cors());

app.use(logger(winston));

app.use(bodyParser());

app.use(v1Router.routes()).use(v1Router.allowedMethods());

app.use(NotFoundError);

export default app;
