import codes from "http-status-codes";

import * as userRepository from "~database/repository/user.repository";
import * as storyRepository from "~database/repository/story.repository";
import * as commentRepository from "~database/repository/comment.repository";
import { castToObjectId, generateHash, generateProfileImage, verifyPassword } from "~utils/index";
import type { AsyncHandler } from "~declarations/index.d";

export const getUserProfile: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId || userId == "") {
         // fetch id from current auth user
         userId = ctx.state.user.id;
      }

      const user = await userRepository.findById({
         id: userId,
         projection: { "hash": 0 },
         filter: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            user
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getUserByUsername: AsyncHandler = async (ctx) => {
   try {
      let username = ctx.request.query["q"];

      if(!username || username == "") {
         ctx.throw(codes.BAD_REQUEST, "missing/malformed request query");
      }

      const user = await userRepository.findOne({
         condition: {
            username
         },
         projection: { "hash": 0 },
         filter: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            user
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getFollowersForUser: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId) {
         // fetch id from current auth user
         userId = ctx.state.user._id;
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      /**
       * we need to cast the array of ids to ObjectIds for the match stage to work
       */
      const userFollowers = [...user.followers].map(id => castToObjectId(`${id}`));

      const followers = await userRepository.buildAggregationPipeline([
         {
            $match: { _id: {
               $in: userFollowers
            }}
         },
         {
            $lookup: { from: "stories", localField: "stories", foreignField: "_id", as: "stories" }
         },
         {
            $unwind: "$stories"
         },
         {
            $lookup: { from: "users", localField: "stories.author", foreignField: "_id", as: "stories.author"}
         },
         {
            $unwind: "$stories.author"
         },
         {
            $group: { 
               _id: "$_id",
               stories: {$push: "$stories"},
               firstname: {$first: "$firstname"},
               lastname: {$first: "$lastname"},
               username: {$first: "$username"},
               avatar: {$first: "$avatar"},
               bio: {$first: "$bio"},
               followers: {$first: "$followers"}
            }
         },
         {
            $project: { hash: 0 }
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            followers
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getFollowingForUser: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId || userId === "") {
         ctx.throw(codes.BAD_REQUEST, "missing/malformed request parameter");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      /**
       * we need to cast the array of ids to ObjectIds for the match stage to work
       */
      const userFollowing = [...user.following].map(id => castToObjectId(`${id}`));

      const following = await userRepository.buildAggregationPipeline([
         {
            $match: { _id: {
               $in: userFollowing
            }}
         },
         {
            $lookup: { from: "stories", localField: "stories", foreignField: "_id", as: "stories" }
         },
         {
            $unwind: "$stories"
         },
         {
            $lookup: { from: "users", localField: "stories.author", foreignField: "_id", as: "stories.author"}
         },
         {
            $unwind: "$stories.author"
         },
         {
            $group: { 
               _id: "$_id",
               stories: {$push: "$stories"},
               firstname: {$first: "$firstname"},
               lastname: {$first: "$lastname"},
               username: {$first: "$username"},
               avatar: {$first: "$avatar"},
               bio: {$first: "$bio"},
               followers: {$first: "$followers"}
            }
         },
         {
            $project: { hash: 0 }
         }
      ]);

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            following
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getLikedStories: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      /**
       * we need to cast the array of ids to ObjectIds for the match stage to work
       */
      const userLikes = [...user.likes].map(id => castToObjectId(`${id}`));

      const stories = await storyRepository.buildAggregationPipeline([
         {
            $match: { _id: {
               $in: userLikes
            }}
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
         message: "resources found.",
         data: {
            likes: stories
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getCollectionsForUser: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      /**
       * we need to cast the array of ids to ObjectIds for the match stage to work
       */
      const usercollections = [...user.collections].map(id => castToObjectId(`${id}`));

      const stories = await storyRepository.buildAggregationPipeline([
         {
            $match: { _id: {
               $in: usercollections
            }}
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
         message: "resources found.",
         data: {
            collections: stories
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getArchiveForUser: AsyncHandler = async (ctx) => {
   try {
      const userId = ctx.params["id"];
      const authorizedUser = ctx.state.user;

      if(!userId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter");
      }

      if(userId !== authorizedUser.id) {
         ctx.throw(codes.FORBIDDEN, "client is not authorized")
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const archive = await storyRepository.find({
         condition: {
            _id: {
               $in: user.archive
            }
         },
         projection: null,
         filter: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            archive
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const getStoriesByUser: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter");
      }

      const stories = await storyRepository.find({
         condition: {
            author: userId
         },
         projection: null,
         filter: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resources found.",
         data: {
            stories
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong.");
   }
}

export const followUser: AsyncHandler = async (ctx) => {
   try {
      const recepientId = ctx.params["id"];
      const initiatorId = ctx.state.user.id;

      if(!recepientId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter.");
      }

      if(!initiatorId) {
         ctx.throw(codes.UNAUTHORIZED, "user is not authenticated.")
      }

      const initiator = await userRepository.updateOne({
         condition: { _id: initiatorId },
         query: {
            $addToSet: {
               following: recepientId
            }
         },
         options: {
            projection: { "hash": 0 }
         }
      });

      await userRepository.updateOne({
         condition: { _id: recepientId },
         query: {
            $addToSet: {
               followers: initiatorId
            }
         },
         options: {
            projection: { "hash": 0 }
         }
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            user: initiator
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const unfollowUser: AsyncHandler = async (ctx) => {
   try {
      const recepientId = ctx.params["id"];
      const initiatorId = ctx.state.user.id;

      if(!recepientId) {
         ctx.throw(codes.BAD_REQUEST, "missing request parameter.");
      }

      if(!initiatorId) {
         ctx.throw(codes.UNAUTHORIZED, "user is not authenticated.")
      }

      const initiator = await userRepository.updateOne({
         condition: { _id: initiatorId },
         query: {
            $pull: {
               following: recepientId
            }
         },
         options: {
            projection: { "hash": 0 }
         }
      });

      await userRepository.updateOne({
         condition: { _id: recepientId },
         query: {
            $pull: {
               followers: initiatorId
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {
            user: initiator
         }
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const updateProfile: AsyncHandler = async (ctx) => {
   try {
      const userId = ctx.params["id"];
      const requestBody = ctx.request.body;
      const updateFields = Object.keys(requestBody);
      const validFields = ["firstname", "lastname", "email", "username", "avatar", "bio"];

      const isValid = updateFields.every(field => validFields.includes(field));

      if(!isValid) {
         ctx.throw(codes.BAD_REQUEST, "invalid property in request body");
      }

      const user = await userRepository.updateOne({
         condition: { _id: userId },
         query: {
            $set: {
               ...requestBody
            }
         },
         options: {
            projection: { "hash": 0 }
         }
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

export const changePassword: AsyncHandler = async (ctx) => {
   try {
      const userId = ctx.params["id"];
      const { oldPassword, password } = ctx.request.body || {};

      if(!oldPassword || !password) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed field in request body");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const isValid = await verifyPassword(oldPassword, user.hash);

      if(!isValid) {
         ctx.throw(codes.BAD_REQUEST, "invalid password");
      }

      const hash = await generateHash(password);

      await userRepository.updateOne({
         condition: { _id: userId },
         query: {
            $set: {
               hash
            }
         },
         options: {}
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource updated.",
         data: {}
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const deleteAccount: AsyncHandler = async (ctx) => {
   try {
      const userId = ctx.params["id"];
      const { password } = ctx.request.body || {};

      if(!password) {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed field in request body");
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const isValid = await verifyPassword(password, user.hash);

      if(!isValid) {
         ctx.throw(codes.BAD_REQUEST, "invalid password");
      }

      // delete all comments associated with user
      await commentRepository.deleteMany({
         condition: {
            author: userId
         }
      });
      // delete stories associated with user
      await storyRepository.deleteMany({
         condition: {
            author: userId
         }
      });

      await userRepository.deleteOne({
         id: userId
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted.",
         data: {}
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

export const deleteProfileImage: AsyncHandler = async (ctx) => {
   try {
      const userId = ctx.params["id"];

      if(!userId || userId === "") {
         ctx.throw(codes.PRECONDITION_FAILED, "missing/malformed request parameter");
      }

      const randomImage = generateProfileImage()

      const user = await userRepository.updateOne({
         condition: { _id: userId },
         query: {
            $set: {
               avatar: randomImage
            }
         },
         options: {
            projection: { hash: 0 }
         }
      });

      ctx.body = {
         ok: true,
         status: codes.OK,
         message: "resource deleted.",
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