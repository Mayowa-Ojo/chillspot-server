import codes from "http-status-codes";
import type { AsyncHandler } from "../declarations/index.d";

import * as userRepository from "~database/repository/user.repository";
import * as storyRepository from "~database/repository/story.repository";

export const getUserProfile: AsyncHandler = async (ctx) => {
   try {
      let userId = ctx.params["id"];

      if(!userId || userId == "") {
         // fetch id from current auth user
         userId = ctx.state.user.id;
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      user.hash = null;

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

      const followers = await userRepository.find({
         condition: {
            _id: {
               $in: user.followers
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

      if(!userId) {
         // fetch id from current auth user
         userId = ctx.state.user.id;
      }

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const following = await userRepository.find({
         condition: {
            _id: {
               $in: user.following
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

      const stories = await storyRepository.find({
         condition: {
            _id: {
               $in: user.likedStories
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

export const getCollectionForUser: AsyncHandler = async (ctx) => {
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

      const collection = await storyRepository.find({
         condition: {
            _id: {
               $in: user.collections
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
            collection
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

      const user = await userRepository.findById({
         id: userId,
         projection: null,
         filter: {}
      });

      const stories = await storyRepository.find({
         condition: {
            author: user._id
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
            $push: {
               following: recepientId
            }
         },
         options: {}
      });

      await userRepository.updateOne({
         condition: { _id: recepientId },
         query: {
            $push: {
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
         data: {}
      }
   } catch (err) {
      if(err.status || err.statusCode) {
         ctx.throw(err.status || err.statusCode, err.message);
      }

      ctx.throw(codes.INTERNAL_SERVER_ERROR, "something went wrong");
   }
}

// export const blockUser: AsyncHandler = async (ctx) => {

// }