import { mongoose } from "@typegoose/typegoose";
import type { Context } from "koa";
import type Aws from "aws-sdk";

declare interface IEnvConfig {
   PORT: string | number
   NODE_ENV: string
   API_VERSION: string | number
   MONGO_URI: string
   DB_NAME: string
   JWT_SECRET: string
   AWS_ACCESS_KEY_ID: string
   AWS_SECRET_ACCESS_KEY: string
   AWS_REGION: string
   AWS_S3_BUCKET: string
}

declare interface IRepositoryPayload {
   id: string
   firstname: string
   lastname: string
   email: string
   username: string
   hash: string
   avatar: string
   filter: unknown
   title: string
   content: string
   author: mongoose.Types.ObjectId
   location: string
   thumbnails: string[]
   tags: string[]
   projection: unknown
   condition: unknown
   options: any
   query: unknown
}

declare type AsyncHandler = (ctx: Context) => Promise<void>

type AsyncUpload = (
   params: Aws.S3.PutObjectRequest, options?: Aws.S3.ManagedUpload.ManagedUploadOptions
) => Promise<Aws.S3.ManagedUpload.SendData>

type AsyncDeleteObject = (
   params: Aws.S3.DeleteObjectRequest
) => Promise<Aws.S3.DeleteObjectOutput>