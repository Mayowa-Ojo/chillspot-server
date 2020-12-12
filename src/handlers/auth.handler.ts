import { Context } from "koa";
import codes from "http-status-codes";

import * as userRepository from "~database/repository/user.repository";
import * as utils from "~utils/index";

export const userLogin = async (ctx: Context) => {
   try {
      const requestBody = ctx.request.body;
      const requiredFields = ["email", "password"];

      let isValid = requiredFields.every((field) => field in requestBody);
      if(!isValid) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed field(s) in request body");
      }

      const { email, password } = requestBody;

      const user = await userRepository.findOne({ 
         condition: { email },
         projection: null,
         filter: {}
      });

      if(!user) {
         ctx.throw(codes.UNAUTHORIZED, "invalid credentials");
      }

      isValid = await utils.verifyPassword(password, user.hash);
      if(!isValid) {
         ctx.throw(codes.UNAUTHORIZED, "invalid credentials");
      }

      const token = utils.generateAuthToken({ id: user._id, email: user.email });

      user.hash = null;

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "login successful",
         data: {
            user,
            token
         }
      }
   } catch (err) {
      if(!err.status) {
         err.status = codes.INTERNAL_SERVER_ERROR;
         err.message = "something went wrong";
      }
      ctx.throw(err.status, err.message);
   }
}

export const userSignup = async (ctx: Context) => {
   try {
      const requestBody = ctx.request.body;
      const requiredFields = ["firstname", "lastname", "email", "password"];

      const isValid = requiredFields.every((field) => field in requestBody);
      if(!isValid) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed field(s) in request body");
      }

      const { firstname, lastname, email, password } = requestBody;

      const user = await userRepository.findOne({
         condition: { email },
         projection: null,
         filter: {}
      });

      if(user) {
         ctx.throw(codes.CONFLICT, "resource already exists");
      }

      // generate username
      const username = await utils.generateUsername({
         firstname,
         lastname
      });

      // hash password
      const hash = await utils.generateHash(password);
      const avatar = utils.generateProfileImage();

      const newUser = await userRepository.create(
         { firstname, lastname, email, hash, username, avatar }
      );

      newUser.hash = null;

      const token = utils.generateAuthToken({ id: newUser._id, email: newUser.email });

      ctx.body = {
         ok: true,
         status: codes.CREATED,
         message: "resource created",
         data: {
            user: newUser,
            token
         }
      }

   } catch (err) {
      if(!err.status) {
         err.status = codes.INTERNAL_SERVER_ERROR;
         err.message = "something went wrong";
      }
      ctx.throw(err.status, err.message);
   }
}