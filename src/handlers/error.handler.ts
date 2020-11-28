import { BaseContext, Next } from "koa";

const errorHandler = async (ctx: BaseContext, next: Next) => {
   try {
      await next();
   } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
         ok: false,
         statusCode: ctx.status,
         message: err.message || "Internal server error"
      }
   }
}

const JwtError = async (ctx: BaseContext, next: Next) => {
   try {
      await next();
   } catch (err) {
      if(err.status === 401) {
         ctx.throw(401, "You are not authorized to view this resource");
      }
   }
}

const NotFoundError = (ctx: BaseContext) => {
   ctx.status = 404;
   ctx.body = {
      ok: false,
      statusCode: ctx.status,
      message: "the requested resource doesn't exist"
   }
}

export { 
   errorHandler,
   JwtError,
   NotFoundError
};