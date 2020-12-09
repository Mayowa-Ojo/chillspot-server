import codes from "http-status-codes";

import * as commentRepository from "~database/repository/comment.repository";
import * as storyRepository from "~database/repository/story.repository";
import { castToObjectId } from "~utils/index";
import type { AsyncHandler } from "~declarations/index.d";

export const getComments: AsyncHandler = async (ctx) => {
   try {
      const comments = await commentRepository.find({
         condition: {},
         projection: null,
         filter: {} // limit, sort
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found",
         data: {
            comments
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const getComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];
      const comment = await commentRepository.findById({
         id: commentId,
         projection: null,
         filter: {}
      });

      if(!comment) {
         ctx.throw(codes.NOT_FOUND, "resource not found");
      }

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource found",
         data: {
            comment
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const createComment: AsyncHandler = async (ctx) => {
   try {
      const requestBody = ctx.request.body;
      const userId = ctx.state.user.id;
      const storyId = ctx.request.query["storyId"];

      if(!userId) {
         ctx.throw(codes.UNAUTHORIZED, "user is not authenticated.")
      }

      if(!storyId || storyId === "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed query parameter");
      }

      if(!requestBody.content) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing field(s).");
      }

      const { content } = requestBody;

      const comment = await commentRepository.create({
         content,
         author: userId,
         story: storyId
      });

      await storyRepository.updateOne({
         condition: { _id: storyId },
         query: {
            $push: {
               comments: comment._id
            }
         },
         options: {}
      });

      const comments = await commentRepository.buildAggregationPipeline([
         {
            $match: { story: castToObjectId(storyId) }
         },
         {
            $sort: { createdAt: -1 }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.CREATED,
         message: "resource created.",
         data: {
            comments,
         }
      };
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const editComment: AsyncHandler = async (ctx) => {
   try {
      const requestBody = ctx.request.body;
      const commentId = ctx.params["id"];

      if(!("content" in requestBody)) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing field in request body.");
      }

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const comment = await commentRepository.updateOne({
         condition: { _id: commentId },
         query: {
            $set: {
               content: requestBody.content
            }
         },
         options: {}
      });

      const comments = await commentRepository.buildAggregationPipeline([
         {
            $match: { story: comment.story }
         },
         {
            $sort: { createdAt: -1 }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comments
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const likeComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];
      const userId = ctx.state.user.id;

      if(!commentId || commentId === "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const comment = await commentRepository.findById({
         id: commentId,
         projection: null,
         filter: {}
      });

      if(comment.likedBy.includes(userId)) {
         await commentRepository.updateOne({
            condition: {
               _id: commentId
            },
            query: {
               $inc: {
                  likes: -1
               },
               $pull: {
                  likedBy: userId
               }
            },
            options: {}
         });
      } else {
         await commentRepository.updateOne({
            condition: {
               _id: commentId
            },
            query: {
               $inc: {
                  likes: 1
               },
               $addToSet: {
                  likedBy: userId
               }
            },
            options: {}
         });
      }

      const comments = await commentRepository.buildAggregationPipeline([
         {
            $match: { story: comment.story }
         },
         {
            $sort: { createdAt: -1 }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comments
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const dislikeComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];
      const userId = ctx.state.user.id;

      if(!commentId || commentId === "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const comment = await commentRepository.findById({
         id: commentId,
         projection: null,
         filter: {}
      });

      if(comment.dislikedBy.includes(userId)) {
         await commentRepository.updateOne({
            condition: {
               _id: commentId
            },
            query: {
               $inc: {
                  dislikes: -1
               },
               $pull: {
                  dislikedBy: userId
               }
            },
            options: {}
         });
      } else {
         await commentRepository.updateOne({
            condition: {
               _id: commentId
            },
            query: {
               $inc: {
                  dislikes: 1
               },
               $addToSet: {
                  dislikedBy: userId
               }
            },
            options: {}
         });
      }

      const comments = await commentRepository.buildAggregationPipeline([
         {
            $match: { story: comment.story }
         },
         {
            $sort: { createdAt: -1 }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comments
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const deleteComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const comment = await commentRepository.deleteOne({
         condition: { _id: commentId }
      });

      const comments = await commentRepository.buildAggregationPipeline([
         {
            $match: { story: comment.story }
         },
         {
            $sort: { createdAt: -1 }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted.",
         data: {
            comments
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}