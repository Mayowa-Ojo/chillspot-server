import { Context, Next } from "koa";
import jwt from "koa-jwt";

import { config } from "../config/env.config";

export const requiresAuth = () => {
   return jwt({ secret: config.JWT_SECRET });
}