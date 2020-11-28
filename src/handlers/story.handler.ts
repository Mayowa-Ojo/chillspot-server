import codes from "http-status-codes";
import type { AsyncHandler } from "../declarations/index.d";

import * as storyRepository from "~database/repository/story.repository";
import * as userRepository from "~database/repository/story.repository";

export const getFeedForUser: AsyncHandler = async (ctx) => {
   try {
      const stories = await storyRepository.find({
         condition: {},
         projection: null,
         filter: {} // limit, sort
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found",
         data: {
            stories
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const searchStories: AsyncHandler = async (ctx) => {
   try {
      const query = ctx.request.query["q"];

      if(!query || query == "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request query.");
      }

      const stories = await storyRepository.find({
         condition: {
            tags: {
               $in: [query]
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
            stories
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const getStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      if(!storyId) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter");
      }

      const story = await storyRepository.findById({
         id: storyId,
         projection: null,
         filter: {}
      });

      if(!story) {
         ctx.throw(codes.NOT_FOUND, "resource not found");
      }

      await countViews(ctx);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource found",
         data: {
            story
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const createStory: AsyncHandler = async (ctx) => {
   try {
      const requestBody = ctx.request.body;
      const requiredFields = ["title", "content", "location", "thumbnails", "tags"];
      const isValid = requiredFields.every(field => field in requestBody);

      if(!isValid) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing fields.");
      }

      const { title, content, location, thumbnails, tags } = requestBody;

      const story = await storyRepository.create({
         title, content, location, thumbnails, tags
      });

      ctx.body = {
         ok: true,
         status: codes.CREATED,
         message: "resource created.",
         data: {
            story
         }
      };
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const likeStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      const result = await storyRepository.updateOne({
         condition: { _id: storyId },
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
            story: result
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const unlikeStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      const result = await storyRepository.updateOne({
         condition: { _id: storyId },
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
            story: result
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const addStoryToCollection: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];
      const userId = ctx.state.user.id;

      if(!storyId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter.");
      }

      if(!userId) {
         ctx.throw(codes.UNAUTHORIZED, "user is not authenticated.")
      }

      const result = await userRepository.updateOne({
         condition: { _id: userId },
         query: {
            $push: {
               collections: storyId
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            story: result
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const deleteStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      if(!storyId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter.");
      }

      const story = await storyRepository.deleteOne({
         condition: {
            _id: storyId
         }
      });

      if(!story) {
         ctx.throw(codes.NOT_FOUND, "resource doesn't exist");
      }

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted",
         data: {
            story
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const countViews: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      await storyRepository.updateOne({
         condition: { _id: storyId },
         query: {
            $inc: {
               views: 1
            }
         },
         options: {}
      });

   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}