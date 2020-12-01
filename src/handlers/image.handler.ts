import * as Aws from "aws-sdk";
import codes from "http-status-codes";
import shortid from "shortid";
import util from "util";

import { config } from "~config/env.config";
import type { AsyncHandler, AsyncUpload, AsyncDeleteObject } from "../declarations";

const s3 = new Aws.S3({
   credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY
   },
   region: config.AWS_REGION
});


const asyncUpload: AsyncUpload = util.promisify(s3.upload).bind(s3);
const asyncDeleteObject: AsyncDeleteObject = util.promisify(s3.deleteObject).bind(s3);

export const uploadFileToBucket: AsyncHandler = async (ctx) => {
   const file = ctx.file;
   const shortId = shortid.generate();

   if(!file) {
      ctx.throw(codes.BAD_REQUEST, "missing/malformed form data.");
   }

   try {
      const result = await asyncUpload({
         Bucket: config.AWS_S3_BUCKET,
         Body: file.buffer,
         Key: `images/${file.originalname}-${shortId}`,
         ContentType: file.mimetype
      });

      ctx.body = {
         ok: true,
         status: codes.CREATED,
         message: "resource created.",
         data: {
            url: result.Location,
            key: result.Key
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

export const deleteObjectFromBucket: AsyncHandler = async (ctx) => {
   try {
      const objectKey = ctx.request.query["key"];

      if(!objectKey || objectKey === "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed query parameter.");
      }

      const result = await asyncDeleteObject({
         Key: objectKey,
         Bucket: config.AWS_S3_BUCKET
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted.",
         data: result
      }
   } catch (err) {
      if(!err.status) {
         err.status = codes.INTERNAL_SERVER_ERROR;
         err.message = "something went wrong";
      }
      ctx.throw(err.status, err.message);
   }
}