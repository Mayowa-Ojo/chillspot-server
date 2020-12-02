import Router from "@koa/router";
import multer from "@koa/multer";

import * as authHandler from "~handlers/auth.handler";
import * as storyHandler from "~handlers/story.handler";
import * as userHandler from "~handlers/user.handler";
import * as commentHandler from "~handlers/comment.handler";
import * as imageHandler from "~handlers/image.handler";
import { requiresAuth } from "../middleware";

const upload = multer({
   limits: {
      fileSize: 5242880
   },
});

const v1Router = new Router();
const storyRouter = new Router({
   prefix: "/stories"
});
const authRouter = new Router({
   prefix: "/auth"
});
const userRouter = new Router({
   prefix: "/users"
});
const commentRouter = new Router({
   prefix: "/comments"
});
const imageRouter = new Router({
   prefix: "/images"
});

// stories router
storyRouter.get("/feed", requiresAuth(), storyHandler.getFeedForUser);
storyRouter.get("/:id", requiresAuth(), storyHandler.getStory);
storyRouter.get("/search", storyHandler.searchStories);
storyRouter.patch("/:id/like", requiresAuth(), storyHandler.likeStory);
storyRouter.patch("/:id/unlike", requiresAuth(), storyHandler.unlikeStory);
storyRouter.patch("/:id/save", requiresAuth(), storyHandler.addStoryToCollection);
storyRouter.post("/", requiresAuth(), storyHandler.createStory);
storyRouter.del("/:id", requiresAuth(), storyHandler.deleteStory);

// auth router
authRouter.post("/login", authHandler.userLogin);
authRouter.post("/signup", authHandler.userSignup);

// users router
userRouter.get("/:id", requiresAuth(), userHandler.getUserProfile);
userRouter.get("/:id/followers", requiresAuth(), userHandler.getFollowersForUser);
userRouter.get("/:id/following", requiresAuth(), userHandler.getFollowingForUser);
userRouter.patch("/:id/follow", requiresAuth(), userHandler.followUser);
userRouter.patch("/:id/unfollow", requiresAuth(), userHandler.unfollowUser);
userRouter.get("/:id/liked-stories", requiresAuth(), userHandler.getLikedStories);
userRouter.get("/:id/collection", requiresAuth(), userHandler.getCollectionForUser);
userRouter.get("/:id/stories", requiresAuth(), userHandler.getStoriesByUser);
userRouter.patch("/:id", requiresAuth(), userHandler.updateProfile);
userRouter.patch("/:id/reset-password", requiresAuth(), userHandler.changePassword);
userRouter.del("/:id", requiresAuth(), userHandler.deleteAccount);
userRouter.del("/:id/avatar", requiresAuth(), userHandler.deleteProfileImage);

// comments router
commentRouter.get("/", requiresAuth(), commentHandler.getCommentsForStory);
commentRouter.get("/:id", requiresAuth(), commentHandler.getComment);
commentRouter.post("/", requiresAuth(), commentHandler.createComment);
commentRouter.patch("/:id/like", requiresAuth(), commentHandler.likeComment);
commentRouter.patch("/:id/unlike", requiresAuth(), commentHandler.unlikeComment);
commentRouter.patch("/:id/dislike", requiresAuth(), commentHandler.dislikeComment);
commentRouter.patch("/:id/undo-dislike", requiresAuth(), commentHandler.undoDislikeComment);
commentRouter.del("/:id", requiresAuth(), commentHandler.deleteComment);

// images router
imageRouter.post("/", requiresAuth(), upload.single("image"), imageHandler.uploadFileToBucket);
imageRouter.del("/", requiresAuth(), imageHandler.deleteObjectFromBucket);

v1Router.use("/api/v1", storyRouter.routes(), storyRouter.allowedMethods());
v1Router.use("/api/v1", authRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", userRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", commentRouter.routes(), authRouter.allowedMethods());
v1Router.use("/api/v1", imageRouter.routes(), authRouter.allowedMethods());

export { v1Router }