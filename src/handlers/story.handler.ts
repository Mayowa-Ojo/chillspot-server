import codes from "http-status-codes";

import * as storyRepository from "~database/repository/story.repository";
import * as userRepository from "~database/repository/user.repository";
import * as commentRepository from "~database/repository/comment.repository";
import type { AsyncHandler } from "~declarations/index.d";
import { castToObjectId, slugify } from "~utils/index";

export const getFeedForUser: AsyncHandler = async (ctx) => { // </stories/feed?sort=popular&limit=5>
   try {
      let sort = ctx.request.query["sort"];
      let limit = ctx.request.query["limit"];

      if(!limit || limit === "") limit = 100;

      switch (sort) {
         case "popular":
            sort = "views"
            break;
         case "recent":
            sort = "createdAt";
            break;
         case "approval":
            sort = "likes";
            break;
         default:
            sort = "createdAt";
            break;
      }

      const stories = await storyRepository.buildAggregationPipeline([
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author"}
         },
         {
            $unwind: "$author"
         },
         {
            $project: { hash: 0 }
         },
         {
            $limit: Number(limit)
         },
         {
            $sort: { [sort]: -1 }
         }
      ]);

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

export const getStoriesByTag: AsyncHandler = async (ctx) => { // </stories/tag?q=beach>
   try {
      const tag = ctx.request.query["q"];

      if(!tag || tag == "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request query.");
      }

      const stories = await storyRepository.buildAggregationPipeline([
         {
            $match: {
               tags: {
                  $in: [tag]
               }
            }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author"}
         },
         {
            $unwind: "$author"
         },
         {
            $project: { "author.hash": 0 }
         }
      ]);

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

      const stories = await storyRepository.buildAggregationPipeline([
         {
            $match: {
               $text: {
                  $search: query
               }
            }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author"}
         },
         {
            $unwind: "$author"
         },
         {
            $addFields: { score: { $meta: "textScore"}}
         },
         {
            $sort: { score: { $meta: "textScore"}}
         },
         {
            $project: { "author.hash": 0 }
         }
      ]);

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

export const getStoryBySlug: AsyncHandler = async (ctx) => {
   try {
      const slug = ctx.request.query["slug"];

      if(!slug || slug == "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter");
      }

      const [story] = await storyRepository.buildAggregationPipeline([
         {
            $match: { slug }
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
         },
         {
            $unwind: "$author"
         }
      ])

      if(!story) {
         ctx.throw(codes.NOT_FOUND, "resource not found");
      }

      await countViews({ slug });

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
      const { user: { id: userId }} = ctx.state;

      if(!isValid) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing fields.");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const { title, content, location, thumbnails, tags } = requestBody;

      const slug = slugify(title);

      const story = await storyRepository.create({
         title, content, location, thumbnails, tags, slug, author: user._id
      });

      await userRepository.updateOne({
         condition: { _id: user._id },
         query: {
            $push: {
               stories: story._id
            }
         },
         options: {}
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
      const userId = ctx.state.user.id;

      let user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });
      console.log("likes", user.likes)
      if(user.likes.includes(storyId)) {
         await storyRepository.updateOne({
            condition: {
               _id: storyId
            },
            query: {
               $inc: {
                  likes: -1
               }
            },
            options: {}
         });

         user = await userRepository.updateOne({
            condition: { _id: userId },
            query: {
               $pull: {
                  likes: storyId
               }
            },
            options: {
               projection: { hash: 0 }
            }
         });
      } else {
         await storyRepository.updateOne({
            condition: {
               _id: storyId
            },
            query: {
               $inc: {
                  likes: 1
               }
            },
            options: {}
         });

         user = await userRepository.updateOne({
            condition: { _id: userId },
            query: {
               $push: {
                  likes: storyId
               }
            },
            options: {
               projection: { hash: 0 }
            }
         });
      }

      const [story] = await storyRepository.buildAggregationPipeline([
         {
            $match: { _id: castToObjectId(storyId)}
         },
         {
            $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author"}
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
            story,
            user
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

      const user = await userRepository.updateOne({
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
            user
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

export const getCommentsForStory: AsyncHandler = async (ctx) => {
   try {
      const storyId = ctx.params["id"];

      if(!storyId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter.");
      }

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
         },
         {
            $project: { "author.hash": 0 }
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource found",
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

export const countViews = async (condition) => {
   try {
      await storyRepository.updateOne({
         condition,
         query: {
            $inc: {
               views: 1
            }
         },
         options: {}
      });

   } catch (err) {
      throw new Error(err.message)
   }
}