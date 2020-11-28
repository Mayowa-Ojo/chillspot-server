import codes from "http-status-codes";
import type { AsyncHandler } from "../declarations/index.d";

import * as commentRepository from "~database/repository/comment.repository";
import * as storyRepository from "~database/repository/story.repository";
import { request } from "https";

export const getCommentsForStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.request.query["storyId"];
      if(!storyId) {
         ctx.throw(codes.BAD_REQUEST, "missing/malformed request query");
      }

      const story = await storyRepository.findById({
         id: storyId,
         projection: null,
         filter: {}
      });

      const comments = await commentRepository.find({
         condition: {
            _id: {
               $in: story.comments
            }
         },
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

      if(!userId) {
         ctx.throw(codes.UNAUTHORIZED, "user is not authenticated.")
      }

      if(!requestBody.content) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing field(s).");
      }

      const { content } = requestBody;

      const comment = commentRepository.create({
         content,
         author: userId
      });

      ctx.body = {
         ok: true,
         status: codes.CREATED,
         message: "resource created.",
         data: {
            comment
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

      const result = await commentRepository.updateOne({
         condition: { _id: commentId },
         query: {
            $set: {
               content: requestBody.content
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comment: result
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

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const result = await commentRepository.updateOne({
         condition: {
            _id: commentId
         },
         query: {
            $inc: {
               likes: 1
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comment: result
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

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const result = await commentRepository.updateOne({
         condition: {
            _id: commentId
         },
         query: {
            $inc: {
               dislikes: 1
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comment: result
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const unlikeComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const result = await commentRepository.updateOne({
         condition: {
            _id: commentId
         },
         query: {
            $inc: {
               likes: -1
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comment: result
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const undoDislikeComment: AsyncHandler = async (ctx) => {
   try {
      const commentId = ctx.params["id"];

      if(!commentId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter.")
      }

      const result = await commentRepository.updateOne({
         condition: {
            _id: commentId
         },
         query: {
            $inc: {
               dislikes: -1
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            comment: result
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

      await commentRepository.deleteOne({
         condition: { _id: commentId }
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted.",
         data: null
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}